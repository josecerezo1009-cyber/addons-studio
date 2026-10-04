import crypto from 'crypto';
import { Pool } from 'pg';
import { createPool } from '../../db/index.ts';
import { encryptToken, decryptToken } from './shopify.ts';

export interface WooCommerceCredentials {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooCommerceStoreDetails {
  name: string;
  url: string;
  version: string;
  currency: string;
  timezone: string;
  productsCount: number;
  ordersCount: number;
  latencyMs: number;
  permissions: 'read' | 'write' | 'read_write';
}

/**
 * WooCommerceAuthService
 * Official WooCommerce REST API v3 authentication, verification,
 * encrypted credential storage, and catalog synchronization service.
 */
export class WooCommerceAuthService {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || createPool();
  }

  /**
   * Sanitizes and normalizes WooCommerce base URL
   */
  public sanitizeUrl(rawUrl: string): string {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  /**
   * Creates HTTP Basic Authorization header for WooCommerce REST API
   */
  private getAuthHeader(consumerKey: string, consumerSecret: string): string {
    const creds = `${consumerKey.trim()}:${consumerSecret.trim()}`;
    return `Basic ${Buffer.from(creds).toString('base64')}`;
  }

  /**
   * Validates WooCommerce connection against live REST API
   */
  public async validateConnection(creds: WooCommerceCredentials): Promise<{
    valid: boolean;
    details?: WooCommerceStoreDetails;
    error?: string;
  }> {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const authHeader = this.getAuthHeader(creds.consumerKey, creds.consumerSecret);
    const startTime = Date.now();

    try {
      // 1. Check system status or basic endpoint
      const testUrl = `${cleanUrl}/wp-json/wc/v3/system_status`;
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
          error: 'Credenciales inválidas: Consumer Key o Consumer Secret incorrectos o sin permisos suficientes.',
        };
      }

      if (!response.ok) {
        // Fallback: Test products endpoint with limit=1
        const productsUrl = `${cleanUrl}/wp-json/wc/v3/products?per_page=1`;
        const prodRes = await fetch(productsUrl, {
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
            error: `Error al conectar con la API de WooCommerce (${prodRes.status}): ${errText.substring(0, 150)}`,
          };
        }

        const domainHost = new URL(cleanUrl).hostname;
        return {
          valid: true,
          details: {
            name: `${domainHost.split('.')[0].toUpperCase()} Store`,
            url: cleanUrl,
            version: 'WooCommerce REST API v3',
            currency: 'EUR',
            timezone: 'UTC',
            productsCount: 0,
            ordersCount: 0,
            latencyMs,
            permissions: 'read_write',
          },
        };
      }

      const statusData = await response.json();
      const domainHost = new URL(cleanUrl).hostname;

      return {
        valid: true,
        details: {
          name: statusData.environment?.site_title || `${domainHost.split('.')[0].toUpperCase()} Store`,
          url: cleanUrl,
          version: `WooCommerce ${statusData.environment?.version || 'v3'}`,
          currency: statusData.settings?.currency || 'EUR',
          timezone: statusData.settings?.timezone || 'UTC',
          productsCount: statusData.database?.database_size || 0,
          ordersCount: 0,
          latencyMs,
          permissions: 'read_write',
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
   * Encrypts and persists WooCommerce store connection in PostgreSQL
   */
  public async saveOrUpdateConnection(creds: WooCommerceCredentials, details?: WooCommerceStoreDetails) {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const domainHost = new URL(cleanUrl).hostname;
    const storeId = `store_wc_${domainHost.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const encryptedKey = encryptToken(creds.consumerKey);
    const encryptedSecret = encryptToken(creds.consumerSecret);
    const combinedEncrypted = `${encryptedKey}||${encryptedSecret}`;

    const storeName = details?.name || `${domainHost.split('.')[0].toUpperCase()} (WooCommerce)`;
    const currency = details?.currency || 'EUR';
    const timezone = details?.timezone || 'UTC';
    const latencyMs = details?.latencyMs || 0;
    const platformVersion = details?.version || 'WooCommerce REST API v3';

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
          $1, $1, 'woocommerce', $2, $3, $3,
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
        combinedEncrypted,
        storeName,
        cleanUrl,
        platformVersion,
        currency,
        timezone,
        latencyMs,
        JSON.stringify({
          platform: 'woocommerce',
          consumerKeyPreview: creds.consumerKey.substring(0, 7) + '...',
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
          $1, $2, $3, $3, 'read_write', NOW(), NOW()
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
          platform: 'woocommerce',
          apiUrl: `${cleanUrl}/wp-json/wc/v3`,
          featuresEnabled: {
            aiOptimization: true,
            realtimeSync: true,
            autoAudit: true,
          },
        }),
      ]);

      // 3. Log audit event in synchronization_logs
      const logId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logSql = `
        INSERT INTO synchronization_logs (
          log_id, store_id, event, event_type, status, items_processed, items_succeeded,
          payload_summary, execution_time_ms, timestamp
        ) VALUES (
          $1, $2, 'woocommerce_handshake', 'woocommerce_handshake', 'completed', 1, 1,
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
      console.error('Failed to save WooCommerce store credentials:', err);
      throw new Error(`Error en base de datos al registrar WooCommerce: ${err.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Fetches products directly from WooCommerce REST API
   */
  public async fetchProducts(creds: WooCommerceCredentials, limit: number = 50): Promise<any[]> {
    const cleanUrl = this.sanitizeUrl(creds.url);
    const authHeader = this.getAuthHeader(creds.consumerKey, creds.consumerSecret);
    const response = await fetch(`${cleanUrl}/wp-json/wc/v3/products?per_page=${limit}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Error al obtener productos de WooCommerce (${response.status}): ${err}`);
    }

    return await response.json();
  }

  /**
   * Retrieves and decrypts WooCommerce credentials from PostgreSQL
   */
  public async getDecryptedCredentials(storeId: string): Promise<WooCommerceCredentials | null> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(
        `SELECT url, encrypted_token FROM stores WHERE id = $1 OR store_id = $1 LIMIT 1;`,
        [storeId]
      );
      if (res.rows.length === 0 || !res.rows[0].encrypted_token) return null;

      const raw = res.rows[0].encrypted_token;
      if (!raw.includes('||')) return null;

      const [encKey, encSecret] = raw.split('||');
      return {
        url: res.rows[0].url,
        consumerKey: decryptToken(encKey),
        consumerSecret: decryptToken(encSecret),
      };
    } finally {
      client.release();
    }
  }
}

export const woocommerceAuthService = new WooCommerceAuthService();
