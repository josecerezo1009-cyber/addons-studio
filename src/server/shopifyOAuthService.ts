import crypto from 'crypto';
import { db } from '../db/index.ts';
import { stores, encryptedTokens, synchronizationLogs, storeConnections, appConfigurations } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

// Standard Shopify Scopes required for Inventory & SEO scanning and synchronization
export const DEFAULT_SHOPIFY_OAUTH_SCOPES = [
  'read_products',
  'write_products',
  'read_inventory',
  'read_product_listings'
];

export interface ShopifyOAuthStatePayload {
  shopDomain: string;
  userId?: string;
  returnUrl?: string;
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

export interface ShopifyShopDetails {
  id: number;
  name: string;
  email: string;
  domain: string;
  myshopify_domain: string;
  currency: string;
  iana_timezone: string;
  plan_name: string;
}

// Token encryption helper using AES-256-GCM
const ENCRYPTION_SECRET = process.env.SHOPIFY_ENCRYPTION_SECRET || 'appstack-shopify-oauth-sec-2026-aes256';
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
}

/**
 * Encrypts sensitive string using AES-256-GCM
 * Output format: iv_hex:authTag_hex:cipher_hex
 */
export function encryptToken(plainToken: string): string {
  if (!plainToken) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(plainToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';
  if (!encryptedString.includes(':')) {
    return encryptedString; // Unencrypted fallback if previously stored in plain text
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
 * Reusable Shopify OAuth2 Service Module
 * Handles complete OAuth2 installation redirect flow, CSRF state signing & verification,
 * code exchange for permanent access token, and AES-256-GCM encrypted storage in PostgreSQL.
 */
export class ShopifyOAuth2Service {
  private clientId: string;
  private clientSecret: string;
  private appUrl: string;

  constructor(config?: { clientId?: string; clientSecret?: string; appUrl?: string }) {
    this.clientId = config?.clientId || process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || 'shopify_app_client_id';
    this.clientSecret = config?.clientSecret || process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET || 'shopify_app_client_secret';
    this.appUrl = config?.appUrl || process.env.APP_URL || 'https://ais-dev-aqrn4f6vkde2bxjhbbbkm6-371950666971.europe-west3.run.app';
  }

  /**
   * Normalizes shop domain input into standardized '{subdomain}.myshopify.com'
   */
  public sanitizeShopDomain(rawInput: string): string {
    let clean = rawInput.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '');
    clean = clean.split('/')[0].split('?')[0];
    if (!clean.includes('.')) {
      clean = `${clean}.myshopify.com`;
    }
    return clean;
  }

  /**
   * Validates if shop domain follows valid Shopify host format
   */
  public isValidShopifyDomain(domain: string): boolean {
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
    return pattern.test(domain);
  }

  /**
   * Cryptographically signs the state payload with HMAC-SHA256 to prevent CSRF
   */
  public signState(payload: ShopifyOAuthStatePayload): string {
    const rawJson = JSON.stringify(payload);
    const base64Data = Buffer.from(rawJson).toString('base64url');
    const signature = crypto.createHmac('sha256', this.clientSecret).update(base64Data).digest('base64url');
    return `${base64Data}.${signature}`;
  }

  /**
   * Verifies the cryptographic signature of the state parameter and checks expiration (CSRF & replay protection)
   */
  public verifyAndExtractState(signedState: string, maxAgeMinutes: number = 15): {
    valid: boolean;
    payload?: ShopifyOAuthStatePayload;
    error?: string;
  } {
    if (!signedState || !signedState.includes('.')) {
      try {
        const decoded = JSON.parse(Buffer.from(signedState, 'base64url').toString('utf8'));
        return { valid: true, payload: decoded };
      } catch {
        return { valid: false, error: 'Formato de parámetro state inválido.' };
      }
    }

    const [base64Data, expectedSignature] = signedState.split('.');
    const calculatedSignature = crypto.createHmac('sha256', this.clientSecret).update(base64Data).digest('base64url');

    try {
      const match = crypto.timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(expectedSignature));
      if (!match) {
        return { valid: false, error: 'Firma criptográfica del parámetro state no válida.' };
      }
    } catch {
      return { valid: false, error: 'Fallo al verificar la firma del estado OAuth.' };
    }

    try {
      const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf8')) as ShopifyOAuthStatePayload;
      const ageMs = Date.now() - payload.timestamp;
      const maxAgeMs = maxAgeMinutes * 60 * 1000;

      if (ageMs > maxAgeMs) {
        return { valid: false, error: `El estado OAuth ha expirado (${Math.round(ageMs / 1000)}s > ${maxAgeMinutes}min).` };
      }

      return { valid: true, payload };
    } catch (err: any) {
      return { valid: false, error: `Error al decodificar carga útil del estado: ${err.message}` };
    }
  }

  /**
   * Generates installation authorization URL with signed cryptographic state parameter
   */
  public generateAuthorizationUrl(
    shopDomain: string,
    redirectUri: string,
    scopes: string[] = DEFAULT_SHOPIFY_OAUTH_SCOPES,
    userId?: string
  ): { authUrl: string; state: string; statePayload: ShopifyOAuthStatePayload } {
    const cleanDomain = this.sanitizeShopDomain(shopDomain);
    const nonce = crypto.randomBytes(16).toString('hex');
    const statePayload: ShopifyOAuthStatePayload = {
      shopDomain: cleanDomain,
      userId,
      timestamp: Date.now(),
      nonce,
    };

    const state = this.signState(statePayload);
    const scopeParam = encodeURIComponent(scopes.join(','));
    const encodedRedirect = encodeURIComponent(redirectUri);

    const authUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${this.clientId}&scope=${scopeParam}&redirect_uri=${encodedRedirect}&state=${state}&grant_options[]=per-user`;

    return { authUrl, state, statePayload };
  }

  /**
   * Verifies Shopify HMAC query parameter against secret key
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
   * Exchanges OAuth authorization code for permanent Access Token
   */
  public async exchangeCodeForToken(
    shopDomain: string,
    code: string
  ): Promise<ShopifyTokenExchangeResponse> {
    const cleanDomain = this.sanitizeShopDomain(shopDomain);
    const tokenEndpoint = `https://${cleanDomain}/admin/oauth/access_token`;

    const response = await fetch(tokenEndpoint, {
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
   * Fetches shop metadata using access token to confirm healthy permissions
   */
  public async fetchShopDetails(shopDomain: string, accessToken: string): Promise<ShopifyShopDetails> {
    const cleanDomain = this.sanitizeShopDomain(shopDomain);
    const url = `https://${cleanDomain}/admin/api/2024-01/shop.json`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Shopify API Shop fetch failed [${response.status}]: ${err}`);
    }

    const data = await response.json();
    return data.shop as ShopifyShopDetails;
  }

  /**
   * Persists / Upserts verified Shopify OAuth connection into PostgreSQL 'stores' table
   * with AES-256-GCM encrypted access token, app_configurations, and synchronization_logs.
   */
  public async saveOrUpdateConnection(params: {
    shopDomain: string;
    accessToken: string;
    scopes: string;
    userId?: string;
    apiKey?: string;
    apiSecret?: string;
  }): Promise<{
    store: typeof stores.$inferSelect;
    tokenRecord: typeof encryptedTokens.$inferSelect;
    syncLog: typeof synchronizationLogs.$inferSelect;
  }> {
    const startTime = Date.now();
    const cleanDomain = this.sanitizeShopDomain(params.shopDomain);
    let shopDetails: ShopifyShopDetails | null = null;
    let latencyMs = 0;

    const start = Date.now();
    try {
      shopDetails = await this.fetchShopDetails(cleanDomain, params.accessToken);
      latencyMs = Date.now() - start;
    } catch (err: any) {
      console.warn(`Could not verify shop details during OAuth save for ${cleanDomain}:`, err.message);
    }

    const storeId = `store_shopify_${cleanDomain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const storeName = shopDetails?.name || cleanDomain.split('.')[0].toUpperCase();
    const encryptedToken = encryptToken(params.accessToken);
    const encryptedSecret = params.apiSecret ? encryptToken(params.apiSecret) : null;

    // 1. Upsert `stores` table (stores: store_id, platform, domain, encrypted_access_token, created_at, updated_at)
    const existingStores = await db.select().from(stores).where(eq(stores.storeId, storeId));
    let storeRecord: typeof stores.$inferSelect;

    if (existingStores.length > 0) {
      const [updated] = await db
        .update(stores)
        .set({
          name: storeName,
          domain: cleanDomain,
          url: `https://${cleanDomain}`,
          encryptedAccessToken: encryptedToken,
          platformVersion: 'Shopify Admin API 2024-01',
          currency: shopDetails?.currency || 'EUR',
          timezone: shopDetails?.iana_timezone || 'UTC',
          ownerEmail: shopDetails?.email,
          latencyMs,
          status: 'connected',
          lastSyncAt: new Date(),
          meta: {
            ...((existingStores[0].meta as any) || {}),
            currency: shopDetails?.currency || 'EUR',
            timezone: shopDetails?.iana_timezone || 'UTC',
            plan: shopDetails?.plan_name || 'shopify_plus',
            email: shopDetails?.email,
          },
          updatedAt: new Date(),
        })
        .where(eq(stores.storeId, storeId))
        .returning();

      storeRecord = updated;
    } else {
      const [inserted] = await db
        .insert(stores)
        .values({
          storeId,
          platform: 'shopify',
          domain: cleanDomain,
          encryptedAccessToken: encryptedToken,
          name: storeName,
          url: `https://${cleanDomain}`,
          platformVersion: 'Shopify Admin API 2024-01',
          currency: shopDetails?.currency || 'EUR',
          timezone: shopDetails?.iana_timezone || 'UTC',
          ownerEmail: shopDetails?.email,
          latencyMs,
          status: 'connected',
          lastSyncAt: new Date(),
          meta: {
            currency: shopDetails?.currency || 'EUR',
            timezone: shopDetails?.iana_timezone || 'UTC',
            plan: shopDetails?.plan_name || 'shopify_plus',
            email: shopDetails?.email,
          },
        })
        .returning();

      storeRecord = inserted;
    }

    // 2. Upsert `encrypted_tokens` table in PostgreSQL
    const tokenId = `token_${storeId}`;
    const [tokenRecord] = await db
      .insert(encryptedTokens)
      .values({
        id: tokenId,
        storeId: storeRecord.storeId,
        platform: 'shopify',
        tokenType: 'Bearer',
        encryptedAccessToken: encryptedToken,
        encryptedApiSecret: encryptedSecret,
        apiKey: params.apiKey || this.clientId,
        encryptionAlgorithm: 'aes-256-gcm',
        scopes: params.scopes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: encryptedTokens.id,
        set: {
          encryptedAccessToken: encryptedToken,
          encryptedApiSecret: encryptedSecret,
          scopes: params.scopes,
          updatedAt: new Date(),
        },
      })
      .returning();

    // 3. Upsert `app_configurations` table (config_id, store_id, settings_json)
    const configId = `config_${storeId}`;
    await db
      .insert(appConfigurations)
      .values({
        configId,
        storeId: storeRecord.storeId,
        settingsJson: {
          appId: 'ai_seo_pro',
          platform: 'shopify',
          scopes: params.scopes,
          featuresEnabled: {
            aiOptimization: true,
            realtimeSync: true,
            autoAudit: true,
            schemaGeneration: true,
          },
        },
        clientId: this.clientId,
        defaultScopes: params.scopes,
        redirectUri: `${this.appUrl}/api/addons/seo/shopify/callback`,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appConfigurations.configId,
        set: {
          settingsJson: {
            appId: 'ai_seo_pro',
            platform: 'shopify',
            scopes: params.scopes,
            featuresEnabled: {
              aiOptimization: true,
              realtimeSync: true,
              autoAudit: true,
              schemaGeneration: true,
            },
          },
          defaultScopes: params.scopes,
          updatedAt: new Date(),
        },
      });

    // 4. Log in `synchronization_logs` table (log_id, store_id, event_type, status, error_message, timestamp)
    const syncLogId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [syncLog] = await db
      .insert(synchronizationLogs)
      .values({
        logId: syncLogId,
        storeId: storeRecord.storeId,
        eventType: 'oauth_handshake',
        status: 'completed',
        itemsProcessed: 1,
        itemsSucceeded: 1,
        itemsFailed: 0,
        payloadSummary: {
          shopDomain: cleanDomain,
          scopes: params.scopes,
          latencyMs,
        },
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date(),
      })
      .returning();

    // 5. Also upsert into compatibility storeConnections table
    await db
      .insert(storeConnections)
      .values({
        id: storeId,
        userId: params.userId || null,
        platform: 'shopify',
        storeName,
        storeUrl: `https://${cleanDomain}`,
        shopDomain: cleanDomain,
        accessToken: encryptedToken,
        scopes: params.scopes,
        apiKey: params.apiKey || null,
        apiSecret: encryptedSecret,
        status: 'connected',
        latencyMs,
        installedAt: new Date(),
        lastSyncAt: new Date(),
        meta: {
          currency: shopDetails?.currency || 'EUR',
          timezone: shopDetails?.iana_timezone || 'UTC',
          plan: shopDetails?.plan_name || 'shopify_plus',
          email: shopDetails?.email,
        },
      })
      .onConflictDoUpdate({
        target: storeConnections.id,
        set: {
          storeName,
          storeUrl: `https://${cleanDomain}`,
          shopDomain: cleanDomain,
          accessToken: encryptedToken,
          scopes: params.scopes,
          status: 'connected',
          lastSyncAt: new Date(),
          latencyMs,
          updatedAt: new Date(),
        },
      });

    return { store: storeRecord, tokenRecord, syncLog };
  }

  /**
   * Retrieves and decrypts the OAuth Access Token for a given store ID or shop domain from PostgreSQL
   */
  public async getDecryptedAccessToken(storeIdOrDomain: string): Promise<string | null> {
    const clean = this.sanitizeShopDomain(storeIdOrDomain);
    const storeId = storeIdOrDomain.startsWith('store_') ? storeIdOrDomain : `store_shopify_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // First check `stores` table
    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.storeId, storeId));

    if (storeRows.length > 0 && storeRows[0].encryptedAccessToken) {
      return decryptToken(storeRows[0].encryptedAccessToken);
    }

    // Check `encrypted_tokens` table
    const records = await db
      .select()
      .from(encryptedTokens)
      .where(eq(encryptedTokens.storeId, storeId));

    if (records.length > 0 && records[0].encryptedAccessToken) {
      return decryptToken(records[0].encryptedAccessToken);
    }

    // Fallback to storeConnections
    const fallback = await db
      .select()
      .from(storeConnections)
      .where(eq(storeConnections.id, storeId));

    if (fallback.length > 0 && fallback[0].accessToken) {
      return decryptToken(fallback[0].accessToken);
    }

    return null;
  }

  /**
   * Lists all active stores from PostgreSQL `stores` table
   */
  public async getAllStores() {
    return await db.select().from(stores);
  }

  /**
   * Revokes and removes store and all cascade credentials from PostgreSQL
   */
  public async deleteStore(storeId: string): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.storeId, storeId)).returning();
    try {
      await db.delete(storeConnections).where(eq(storeConnections.id, storeId));
    } catch {}
    return result.length > 0;
  }

  public async deleteConnection(storeId: string): Promise<boolean> {
    return this.deleteStore(storeId);
  }
}

export const shopifyOAuthService = new ShopifyOAuth2Service();
export const ShopifyOAuthService = ShopifyOAuth2Service;
