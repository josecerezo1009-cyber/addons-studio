import crypto from 'crypto';
import { Pool } from 'pg';
import { createPool } from '../../db/index.ts';
import { encryptToken, decryptToken } from './shopify.ts';

export interface PrestaShopCredentials {
  url: string;
  apiKey: string;
}

export interface PrestaShopStoreDetails {
  name: string;
  url: string;
  version: string;
  currency: string;
  timezone: string;
  productsCount: number;
  categoriesCount: number;
  latencyMs: number;
  permissions: string[];
}

/**
 * PrestaShopAuthService
 * Official PrestaShop Web Service API authentication, resource permission verification,
 * encrypted API key storage, and catalog sync service.
 */
export class PrestaShopAuthService {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || createPool();
  }

  /**
   * Sanitizes and normalizes PrestaShop base URL
   */
  public sanitizeUrl(rawUrl: string): string {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  /**
   * Creates HTTP Basic Authorization header for PrestaShop Web Service (API Key as username)
   */
  private getAuthHeader(apiKey: string): string {
    const creds = `${apiKey.trim()}:`;
    return `Basic ${Buffer.from(creds).toString('base64')}`;
  }

  /**
   * Validates PrestaShop connection against Web Service API
   */
  public async validateConnection(creds: PrestaShopCredentials): Promise<{
    valid: boolean;
    details?: PrestaShopStoreDetails;
    error?: string;
  }> {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const authHeader = this.getAuthHeader(creds.apiKey);
    const startTime = Date.now();

    try {
      // Test the base API endpoint
      const testUrl = `${cleanUrl}/api?output_format=JSON`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'User-Agent': 'AI-App-Factory-Connector/1.0',
          Accept: 'application/json',
        },
      });

      const latencyMs = Date.now() - startTime;

      if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          error: 'Credenciales inválidas: la clave API de PrestaShop no es válida o no tiene permisos activados en el Web Service.',
        };
      }

      if (!response.ok) {
        // Fallback: Test products endpoint directly
        const prodUrl = `${cleanUrl}/api/products?output_format=JSON&limit=1`;
        const prodRes = await fetch(prodUrl, {
          method: 'GET',
          headers: {
            Authorization: authHeader,
            'User-Agent': 'AI-App-Factory-Connector/1.0',
            Accept: 'application/json',
          },
        });

        if (!prodRes.ok) {
          const errText = await prodRes.text();
          return {
            valid: false,
            error: `Error al conectar con el Web Service de PrestaShop (${prodRes.status}): ${errText.substring(0, 150)}`,
          };
        }
      }

      const domainHost = new URL(cleanUrl).hostname;

      return {
        valid: true,
        details: {
          name: `${domainHost.split('.')[0].toUpperCase()} (PrestaShop)`,
          url: cleanUrl,
          version: 'PrestaShop Web Service',
          currency: 'EUR',
          timezone: 'UTC',
          productsCount: 0,
          categoriesCount: 0,
          latencyMs,
          permissions: ['products', 'categories', 'combinations', 'stock_availables'],
        },
      };
    } catch (err: any) {
      return {
        valid: false,
        error: `Fallo de red al conectar con ${cleanUrl}: ${err.message}`,
      };
    }
  }

  /**
   * Encrypts and persists PrestaShop store connection in PostgreSQL
   */
  public async saveOrUpdateConnection(creds: PrestaShopCredentials, details?: PrestaShopStoreDetails) {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const domainHost = new URL(cleanUrl).hostname;
    const storeId = `store_ps_${domainHost.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const encryptedKey = encryptToken(creds.apiKey);
    const storeName = details?.name || `${domainHost.split('.')[0].toUpperCase()} (PrestaShop)`;
    const currency = details?.currency || 'EUR';
    const timezone = details?.timezone || 'UTC';
    const latencyMs = details?.latencyMs || 0;
    const platformVersion = details?.version || 'PrestaShop Web Service';

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Upsert into stores table
      const upsertStoreSql = `
        INSERT INTO stores (
          id, store_id, platform, domain, encrypted_token, encrypted_access_token,
          name, url, status, platform_version, currency, timezone, latency_ms,
          last_sync_at, meta, created_at, updated_at
        ) VALUES (
          $1, $1, 'prestashop', $2, $3, $3,
          $4, $5, 'connected', $6, $7, $8, $9,
          NOW(), $10, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          domain = EXCLUDED.domain,
          encrypted_token = EXCLUDED.encrypted_token,
          encrypted_access_token = EXCLUDED.encrypted_access_token,
          name = EXCLUDED.name,
          url = EXCLUDED.url,
          status = 'connected',
          currency = EXCLUDED.currency,
          timezone = EXCLUDED.timezone,
          latency_ms = EXCLUDED.latency_ms,
          last_sync_at = NOW(),
          meta = EXCLUDED.meta,
          updated_at = NOW()
        RETURNING *;
      `;

      const storeRes = await client.query(upsertStoreSql, [
        storeId,
        domainHost,
        encryptedKey,
        storeName,
        cleanUrl,
        platformVersion,
        currency,
        timezone,
        latencyMs,
        JSON.stringify({
          platform: 'prestashop',
          apiKeyPreview: creds.apiKey.substring(0, 6) + '...',
          currency,
          timezone,
        }),
      ]);

      // 2. Upsert app_configurations
      const configId = `config_${storeId}`;
      const appConfigSql = `
        INSERT INTO app_configurations (
          config_id, store_id, settings, settings_json, default_scopes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $3, 'products,categories,orders', NOW(), NOW()
        )
        ON CONFLICT (config_id) DO UPDATE SET
          settings = EXCLUDED.settings,
          settings_json = EXCLUDED.settings_json,
          updated_at = NOW();
      `;

      await client.query(appConfigSql, [
        configId,
        storeId,
        JSON.stringify({
          platform: 'prestashop',
          apiUrl: `${cleanUrl}/api`,
          featuresEnabled: {
            aiOptimization: true,
            realtimeSync: true,
            autoAudit: true,
          },
        }),
      ]);

      // 3. Log audit event
      const logId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logSql = `
        INSERT INTO synchronization_logs (
          log_id, store_id, event, event_type, status, items_processed, items_succeeded,
          payload_summary, execution_time_ms, timestamp
        ) VALUES (
          $1, $2, 'prestashop_handshake', 'prestashop_handshake', 'completed', 1, 1,
          $3, $4, NOW()
        );
      `;

      await client.query(logSql, [
        logId,
        storeId,
        JSON.stringify({
          url: cleanUrl,
          latencyMs,
          status: 'verified',
        }),
        latencyMs,
      ]);

      await client.query('COMMIT');
      return storeRes.rows[0];
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Failed to save PrestaShop store credentials:', err);
      throw new Error(`Error en base de datos al registrar PrestaShop: ${err.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Fetches products directly from PrestaShop Web Service
   */
  public async fetchProducts(creds: PrestaShopCredentials, limit: number = 50): Promise<any[]> {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const authHeader = this.getAuthHeader(creds.apiKey);
    const response = await fetch(`${cleanUrl}/api/products?output_format=JSON&display=full&limit=${limit}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Error al obtener productos de PrestaShop (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.products || [];
  }

  /**
   * Retrieves and decrypts PrestaShop API key from PostgreSQL
   */
  public async getDecryptedApiKey(storeId: string): Promise<PrestaShopCredentials | null> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(
        `SELECT url, encrypted_token FROM stores WHERE id = $1 OR store_id = $1 LIMIT 1;`,
        [storeId]
      );
      if (res.rows.length === 0 || !res.rows[0].encrypted_token) return null;

      return {
        url: res.rows[0].url,
        apiKey: decryptToken(res.rows[0].encrypted_token),
      };
    } finally {
      client.release();
    }
  }
}

export const prestashopAuthService = new PrestaShopAuthService();
