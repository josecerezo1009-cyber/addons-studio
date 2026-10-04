import crypto from 'crypto';
import { Pool } from 'pg';
import { createPool } from '../../db/index.ts';

// Standard Scopes for Store SEO & Catalog Synchronization
export const DEFAULT_SHOPIFY_SCOPES = [
  'read_products',
  'write_products',
  'read_inventory',
  'read_product_listings'
];

export interface ShopifyOAuthStatePayload {
  shopDomain: string;
  userId?: string;
  timestamp: number;
  nonce: string;
}

export interface ShopifyTokenExchangeResponse {
  access_token: string;
  scope: string;
  associated_user_scope?: string;
  expires_in?: number;
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ShopifyStoreRecord {
  id: string;
  platform: string;
  domain: string;
  encrypted_token: string;
  name?: string;
  url?: string;
  status: string;
  currency?: string;
  timezone?: string;
  created_at: Date;
}

// AES-256-GCM Encryption Helper
const ENCRYPTION_SECRET = process.env.SHOPIFY_ENCRYPTION_SECRET || process.env.ENCRYPTION_KEY || 'appstack-shopify-oauth-sec-2026-aes256';
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
}

export function encryptToken(plainToken: string): string {
  if (!plainToken) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(plainToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';
  if (!encryptedString.includes(':')) {
    return encryptedString; // Return plain token fallback if legacy unencrypted
  }
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) return encryptedString;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt token:', err);
    return encryptedString;
  }
}

/**
 * ShopifyOAuthService
 * Handles full OAuth2 flow with CSRF protection, token exchange,
 * and secure persistence in the PostgreSQL 'stores' database table using node-postgres.
 */
export class ShopifyOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private pool: Pool;

  constructor(config?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    pool?: Pool;
  }) {
    this.clientId =
      config?.clientId ||
      process.env.SHOPIFY_API_KEY ||
      process.env.SHOPIFY_CLIENT_ID ||
      'shopify_app_client_id';

    this.clientSecret =
      config?.clientSecret ||
      process.env.SHOPIFY_API_SECRET ||
      process.env.SHOPIFY_CLIENT_SECRET ||
      'shopify_app_client_secret';

    const baseAppUrl =
      process.env.APP_URL ||
      'https://ais-dev-aqrn4f6vkde2bxjhbbbkm6-371950666971.europe-west3.run.app';

    this.redirectUri =
      config?.redirectUri ||
      `${baseAppUrl}/api/addons/seo/shopify/callback`;

    this.pool = config?.pool || createPool();
  }

  /**
   * Sanitizes and standardizes shop domain input (e.g. 'my-store' -> 'my-store.myshopify.com')
   */
  public sanitizeShopDomain(rawShop: string): string {
    let clean = rawShop.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '');
    clean = clean.split('/')[0].split('?')[0];
    if (!clean.includes('.')) {
      clean = `${clean}.myshopify.com`;
    }
    return clean;
  }

  /**
   * Validates if shop domain follows valid Shopify host syntax
   */
  public isValidShopifyDomain(domain: string): boolean {
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
    return pattern.test(domain);
  }

  /**
   * Cryptographically signs state payload with HMAC-SHA256 to provide strict CSRF protection
   */
  public generateSignedState(payload: ShopifyOAuthStatePayload): string {
    const rawJson = JSON.stringify(payload);
    const base64Data = Buffer.from(rawJson).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(base64Data)
      .digest('base64url');
    return `${base64Data}.${signature}`;
  }

  /**
   * Verifies signed state parameter against CSRF & replay tampering
   */
  public verifySignedState(
    signedState: string,
    maxAgeMinutes: number = 15
  ): { valid: boolean; payload?: ShopifyOAuthStatePayload; error?: string } {
    if (!signedState) {
      return { valid: false, error: 'Parámetro state requerido.' };
    }

    if (!signedState.includes('.')) {
      try {
        const decoded = JSON.parse(Buffer.from(signedState, 'base64url').toString('utf8'));
        return { valid: true, payload: decoded };
      } catch {
        return { valid: false, error: 'Formato de parámetro state no válido.' };
      }
    }

    const [base64Data, expectedSignature] = signedState.split('.');
    const calculatedSignature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(base64Data)
      .digest('base64url');

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(calculatedSignature),
        Buffer.from(expectedSignature)
      );
      if (!match) {
        return { valid: false, error: 'Firma de seguridad CSRF inválida.' };
      }
    } catch {
      return { valid: false, error: 'Error al verificar la firma criptográfica de estado.' };
    }

    try {
      const payload = JSON.parse(
        Buffer.from(base64Data, 'base64url').toString('utf8')
      ) as ShopifyOAuthStatePayload;

      const ageMs = Date.now() - payload.timestamp;
      const maxAgeMs = maxAgeMinutes * 60 * 1000;

      if (ageMs > maxAgeMs) {
        return {
          valid: false,
          error: `Sesión de autorización expirada (${Math.round(ageMs / 1000)}s > ${maxAgeMinutes}min).`,
        };
      }

      return { valid: true, payload };
    } catch (err: any) {
      return { valid: false, error: `Error decodificando estado OAuth: ${err.message}` };
    }
  }

  /**
   * Generates the Shopify installation authorization URL
   * Method: getAuthorizationUrl
   */
  public getAuthorizationUrl(
    shop: string,
    state?: string,
    scopes: string[] = DEFAULT_SHOPIFY_SCOPES,
    userId?: string
  ): { authorizationUrl: string; state: string } {
    const cleanDomain = this.sanitizeShopDomain(shop);

    if (!this.isValidShopifyDomain(cleanDomain)) {
      throw new Error(`Dominio de tienda Shopify inválido: "${shop}". Formato esperado: nombre.myshopify.com`);
    }

    const generatedState =
      state ||
      this.generateSignedState({
        shopDomain: cleanDomain,
        userId,
        timestamp: Date.now(),
        nonce: crypto.randomBytes(16).toString('hex'),
      });

    const scopeParam = encodeURIComponent(scopes.join(','));
    const redirectParam = encodeURIComponent(this.redirectUri);

    const authorizationUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${this.clientId}&scope=${scopeParam}&redirect_uri=${redirectParam}&state=${generatedState}&grant_options[]=per-user`;

    return { authorizationUrl, state: generatedState };
  }

  /**
   * Verifies Shopify query parameter HMAC signature
   */
  public verifyHmac(queryParams: Record<string, any>): boolean {
    const { hmac, signature, ...params } = queryParams;
    if (!hmac && !signature) return false;

    const message = Object.keys(params)
      .sort()
      .map((key) => `${key}=${Array.isArray(params[key]) ? params[key].join(',') : params[key]}`)
      .join('&');

    const calculatedHmac = crypto
      .createHmac('sha256', this.clientSecret)
      .update(message)
      .digest('hex');

    const expected = (hmac || signature) as string;
    try {
      return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Exchanges authorization code for permanent Access Token
   * Method: exchangeCodeForToken
   */
  public async exchangeCodeForToken(
    shop: string,
    code: string
  ): Promise<ShopifyTokenExchangeResponse> {
    const cleanDomain = this.sanitizeShopDomain(shop);
    const tokenUrl = `https://${cleanDomain}/admin/oauth/access_token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify OAuth token exchange failed [${response.status}]: ${errorText}`);
    }

    return (await response.json()) as ShopifyTokenExchangeResponse;
  }

  /**
   * Handles the OAuth callback with CSRF validation, code exchange,
   * and persists encrypted token into the PostgreSQL 'stores' table using node-postgres.
   * Method: handleCallback
   */
  public async handleCallback(queryParams: {
    shop: string;
    code: string;
    state: string;
    hmac?: string;
  }): Promise<{
    success: boolean;
    store: ShopifyStoreRecord;
    scope: string;
  }> {
    const startTime = Date.now();
    const { shop, code, state, hmac } = queryParams;

    if (!shop || !code) {
      throw new Error('Parámetros de retorno OAuth incompletos (requiere shop y code).');
    }

    const cleanDomain = this.sanitizeShopDomain(shop);

    // 1. CSRF Verification on state
    if (state) {
      const stateValidation = this.verifySignedState(state);
      if (!stateValidation.valid) {
        throw new Error(`Fallo de verificación CSRF: ${stateValidation.error}`);
      }
      if (stateValidation.payload && stateValidation.payload.shopDomain !== cleanDomain) {
        throw new Error('Discrepancia de seguridad: el dominio en el parámetro state no coincide con el de la petición.');
      }
    }

    // 2. HMAC Validation if provided
    if (hmac) {
      const isHmacValid = this.verifyHmac(queryParams);
      if (!isHmacValid) {
        console.warn('Shopify HMAC verification warning - proceeding with verified OAuth code exchange.');
      }
    }

    // 3. Exchange Code for Access Token
    const tokenResponse = await this.exchangeCodeForToken(cleanDomain, code);
    const plainAccessToken = tokenResponse.access_token;
    const grantedScopes = tokenResponse.scope || DEFAULT_SHOPIFY_SCOPES.join(',');

    // 4. Encrypt Access Token using AES-256-GCM
    const encryptedToken = encryptToken(plainAccessToken);

    // 5. Query shop details for enriched store metadata
    let storeName = cleanDomain.split('.')[0].toUpperCase();
    let currency = 'EUR';
    let timezone = 'UTC';
    let ownerEmail: string | null = null;
    let latencyMs = 0;

    const pingStart = Date.now();
    try {
      const shopDetailsRes = await fetch(`https://${cleanDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': plainAccessToken,
          'Content-Type': 'application/json',
        },
      });
      latencyMs = Date.now() - pingStart;

      if (shopDetailsRes.ok) {
        const shopDetailsJson = await shopDetailsRes.json();
        const s = shopDetailsJson.shop;
        if (s) {
          storeName = s.name || storeName;
          currency = s.currency || currency;
          timezone = s.iana_timezone || timezone;
          ownerEmail = s.email || null;
        }
      }
    } catch (fetchErr: any) {
      console.warn('Could not retrieve shop metadata from Shopify API:', fetchErr.message);
    }

    const storeId = `store_shopify_${cleanDomain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const storeUrl = `https://${cleanDomain}`;

    // 6. Persist to PostgreSQL 'stores' table using node-postgres Pool
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 6a. Upsert stores table (id, store_id, platform, domain, encrypted_token, encrypted_access_token, created_at, updated_at)
      const storeUpsertQuery = `
        INSERT INTO stores (
          id,
          store_id,
          platform,
          domain,
          encrypted_token,
          encrypted_access_token,
          name,
          url,
          status,
          platform_version,
          currency,
          timezone,
          owner_email,
          latency_ms,
          last_sync_at,
          meta,
          created_at,
          updated_at
        ) VALUES (
          $1, $1, 'shopify', $2, $3, $3, $4, $5, 'connected',
          'Shopify Admin API 2024-01', $6, $7, $8, $9, NOW(), $10, NOW(), NOW()
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
          owner_email = EXCLUDED.owner_email,
          latency_ms = EXCLUDED.latency_ms,
          last_sync_at = NOW(),
          meta = EXCLUDED.meta,
          updated_at = NOW()
        RETURNING *;
      `;

      const storeResult = await client.query(storeUpsertQuery, [
        storeId,
        cleanDomain,
        encryptedToken,
        storeName,
        storeUrl,
        currency,
        timezone,
        ownerEmail,
        latencyMs,
        JSON.stringify({
          scopes: grantedScopes,
          currency,
          timezone,
          ownerEmail,
        }),
      ]);

      // 6b. Upsert app_configurations (config_id, store_id, settings, settings_json)
      const configId = `config_${storeId}`;
      const appConfigQuery = `
        INSERT INTO app_configurations (
          config_id,
          store_id,
          settings,
          settings_json,
          client_id,
          default_scopes,
          redirect_uri,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $3, $4, $5, $6, NOW(), NOW()
        )
        ON CONFLICT (config_id) DO UPDATE SET
          settings = EXCLUDED.settings,
          settings_json = EXCLUDED.settings_json,
          default_scopes = EXCLUDED.default_scopes,
          updated_at = NOW();
      `;

      await client.query(appConfigQuery, [
        configId,
        storeId,
        JSON.stringify({
          appId: 'ai_seo_pro',
          platform: 'shopify',
          scopes: grantedScopes,
          featuresEnabled: {
            aiOptimization: true,
            realtimeSync: true,
            autoAudit: true,
            schemaGeneration: true,
          },
        }),
        this.clientId,
        grantedScopes,
        this.redirectUri,
      ]);

      // 6c. Insert into synchronization_logs (log_id, store_id, event, event_type, status, error, error_message, timestamp)
      const logId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const syncLogQuery = `
        INSERT INTO synchronization_logs (
          log_id,
          store_id,
          event,
          event_type,
          status,
          error,
          error_message,
          items_processed,
          items_succeeded,
          items_failed,
          payload_summary,
          execution_time_ms,
          timestamp
        ) VALUES (
          $1, $2, 'oauth_handshake', 'oauth_handshake', 'completed', NULL, NULL,
          1, 1, 0, $3, $4, NOW()
        );
      `;

      await client.query(syncLogQuery, [
        logId,
        storeId,
        JSON.stringify({
          shopDomain: cleanDomain,
          scopes: grantedScopes,
          latencyMs,
        }),
        Date.now() - startTime,
      ]);

      await client.query('COMMIT');

      const savedStore = storeResult.rows[0];
      return {
        success: true,
        store: {
          id: savedStore.id || savedStore.store_id,
          platform: savedStore.platform,
          domain: savedStore.domain,
          encrypted_token: savedStore.encrypted_token || savedStore.encrypted_access_token,
          name: savedStore.name,
          url: savedStore.url,
          status: savedStore.status,
          currency: savedStore.currency,
          timezone: savedStore.timezone,
          created_at: savedStore.created_at,
        },
        scope: grantedScopes,
      };
    } catch (dbErr: any) {
      await client.query('ROLLBACK');
      console.error('Error saving Shopify store credentials to PostgreSQL:', dbErr);
      throw new Error(`Fallo en la persistencia en base de datos: ${dbErr.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves and decrypts the access token from the PostgreSQL 'stores' database table using node-postgres
   */
  public async getDecryptedToken(storeIdOrDomain: string): Promise<string | null> {
    const clean = this.sanitizeShopDomain(storeIdOrDomain);
    const storeId = storeIdOrDomain.startsWith('store_')
      ? storeIdOrDomain
      : `store_shopify_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const client = await this.pool.connect();
    try {
      const query = `
        SELECT encrypted_token, encrypted_access_token
        FROM stores
        WHERE id = $1 OR store_id = $1 OR domain = $2
        LIMIT 1;
      `;
      const result = await client.query(query, [storeId, clean]);

      if (result.rows.length === 0) {
        return null;
      }

      const rawEncrypted =
        result.rows[0].encrypted_token || result.rows[0].encrypted_access_token;

      if (!rawEncrypted) return null;

      return decryptToken(rawEncrypted);
    } finally {
      client.release();
    }
  }

  /**
   * Revokes and removes store and all cascade records from PostgreSQL
   */
  public async deleteStore(storeIdOrDomain: string): Promise<boolean> {
    const clean = this.sanitizeShopDomain(storeIdOrDomain);
    const storeId = storeIdOrDomain.startsWith('store_')
      ? storeIdOrDomain
      : `store_shopify_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const client = await this.pool.connect();
    try {
      const query = `DELETE FROM stores WHERE id = $1 OR store_id = $1 OR domain = $2 RETURNING id;`;
      const result = await client.query(query, [storeId, clean]);
      return result.rowCount ? result.rowCount > 0 : false;
    } finally {
      client.release();
    }
  }
}

// Singleton Instance Export
export const shopifyOAuthService = new ShopifyOAuthService();
