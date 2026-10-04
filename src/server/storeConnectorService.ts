import { db } from '../db/index.ts';
import { storeConnections, storeMetadata, ecommerceSyncLogs, storeProducts, seoAuditHistory } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { encryptToken, decryptToken, shopifyOAuthService } from './shopifyOAuthService.ts';

// ==========================================
// UNIFIED TYPES & INTERFACES
// ==========================================

export type SupportedPlatform = 'shopify' | 'woocommerce' | 'prestashop';

export interface StoreCredentialsInput {
  platform: SupportedPlatform;
  url: string;
  shopDomain?: string;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  userId?: string;
}

export interface ConnectionValidationResult {
  valid: boolean;
  platform: SupportedPlatform;
  storeUrl: string;
  shopDomain?: string;
  storeName: string;
  scopesGranted: string[];
  connectionMethod: string;
  latencyMs: number;
  platformVersion?: string;
  meta: {
    currency?: string;
    timezone?: string;
    email?: string;
    plan?: string;
    totalProducts?: number;
    [key: string]: any;
  };
  error?: string;
  details?: any;
}

export interface UnifiedProductRecord {
  id: string;
  externalProductId: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  descriptionText: string;
  currentMetaTitle: string;
  currentMetaDescription: string;
  canonicalUrl: string;
  inventoryQuantity: number;
  images: Array<{ url: string; alt?: string; width?: number; height?: number }>;
  variants: any[];
  tags: string[];
}

export interface ProductSyncPayload {
  externalProductId: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  descriptionHtml?: string;
  imagesAlt?: Array<{ id?: string; url: string; alt: string }>;
}

export interface SyncResult {
  success: boolean;
  platform: SupportedPlatform;
  syncedVia: string;
  message: string;
  updatedFields: string[];
  rawResponse?: any;
  error?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unauthorized' | 'error';
  latencyMs: number;
  message: string;
  checkedAt: string;
  details?: any;
}

export interface IEcommerceStoreConnector {
  readonly platform: SupportedPlatform;
  validateCredentials(credentials: StoreCredentialsInput): Promise<ConnectionValidationResult>;
  fetchStoreMetadata(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string; apiKey?: string; apiSecret?: string }): Promise<any>;
  fetchCatalog(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string; apiKey?: string; apiSecret?: string }): Promise<UnifiedProductRecord[]>;
  syncProduct(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string; apiKey?: string; apiSecret?: string }, payload: ProductSyncPayload): Promise<SyncResult>;
  checkHealth(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string; apiKey?: string; apiSecret?: string }): Promise<HealthCheckResult>;
}

// ==========================================
// 1. SHOPIFY UNIFIED CONNECTOR
// ==========================================

export class ShopifyConnectorAdapter implements IEcommerceStoreConnector {
  public readonly platform: SupportedPlatform = 'shopify';

  public sanitizeDomain(input: string): string {
    let clean = input.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
    if (!clean.includes('.')) {
      clean = `${clean}.myshopify.com`;
    }
    return clean;
  }

  public async validateCredentials(credentials: StoreCredentialsInput): Promise<ConnectionValidationResult> {
    const start = Date.now();
    const cleanDomain = this.sanitizeDomain(credentials.shopDomain || credentials.url);
    const token = credentials.accessToken || credentials.apiKey;

    if (!cleanDomain.includes('.myshopify.com') && !cleanDomain.includes('.')) {
      return {
        valid: false,
        platform: 'shopify',
        storeUrl: `https://${cleanDomain}`,
        storeName: cleanDomain,
        scopesGranted: [],
        connectionMethod: 'Shopify Admin API',
        latencyMs: Date.now() - start,
        meta: {},
        error: 'El dominio proporcionado no es un subdominio válido de Shopify (*.myshopify.com o dominio personalizado).',
      };
    }

    // Handshake against Shopify Admin REST API
    const testUrl = `https://${cleanDomain}/admin/api/2024-01/shop.json`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['X-Shopify-Access-Token'] = token;
    }

    try {
      const response = await fetch(testUrl, { headers });
      const latencyMs = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        const shop = data.shop || {};
        const scopesHeader = response.headers.get('x-shopify-access-scope') || 'read_products,write_products,read_inventory,read_product_listings';

        return {
          valid: true,
          platform: 'shopify',
          storeUrl: `https://${cleanDomain}`,
          shopDomain: cleanDomain,
          storeName: shop.name || cleanDomain.split('.')[0].toUpperCase(),
          scopesGranted: scopesHeader.split(',').map((s: string) => s.trim()),
          connectionMethod: token ? 'Shopify Admin OAuth Access Token' : 'Shopify Public Catalog Verification',
          latencyMs,
          platformVersion: 'Shopify Admin API 2024-01',
          meta: {
            currency: shop.currency || 'EUR',
            timezone: shop.iana_timezone || 'UTC',
            email: shop.email,
            plan: shop.plan_name || 'shopify_plus',
            country: shop.country_code || 'ES',
          },
        };
      }

      // If token invalid or private app error, test public catalog as verification fallback
      const pubResp = await fetch(`https://${cleanDomain}/products.json?limit=1`);
      if (pubResp.ok) {
        const pubData = await pubResp.json();
        return {
          valid: true,
          platform: 'shopify',
          storeUrl: `https://${cleanDomain}`,
          shopDomain: cleanDomain,
          storeName: cleanDomain.split('.')[0].toUpperCase(),
          scopesGranted: ['read_products'],
          connectionMethod: 'Shopify Storefront REST Verification',
          latencyMs: Date.now() - start,
          platformVersion: 'Shopify Storefront 2024-01',
          meta: {
            currency: 'EUR',
            timezone: 'UTC',
            totalProducts: pubData.products ? pubData.products.length : 0,
          },
        };
      }

      return {
        valid: false,
        platform: 'shopify',
        storeUrl: `https://${cleanDomain}`,
        storeName: cleanDomain,
        scopesGranted: [],
        connectionMethod: 'Shopify Admin API',
        latencyMs: Date.now() - start,
        meta: {},
        error: `Error de autenticación Shopify (${response.status}): Verifique el Access Token o los permisos OAuth de la tienda.`,
      };
    } catch (err: any) {
      return {
        valid: false,
        platform: 'shopify',
        storeUrl: `https://${cleanDomain}`,
        storeName: cleanDomain,
        scopesGranted: [],
        connectionMethod: 'Shopify Admin API',
        latencyMs: Date.now() - start,
        meta: {},
        error: `No se pudo conectar con el servidor de Shopify: ${err.message}`,
      };
    }
  }

  public async fetchStoreMetadata(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string }): Promise<any> {
    const cleanDomain = this.sanitizeDomain(store.shopDomain || store.storeUrl);
    const token = decryptedTokens.accessToken || store.apiKey;

    const url = `https://${cleanDomain}/admin/api/2024-01/shop.json`;
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.shop;
    }
    return { name: store.storeName, domain: cleanDomain };
  }

  public async fetchCatalog(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string }): Promise<UnifiedProductRecord[]> {
    const cleanDomain = this.sanitizeDomain(store.shopDomain || store.storeUrl);
    const token = decryptedTokens.accessToken || store.apiKey;

    let rawProducts: any[] = [];
    const adminUrl = `https://${cleanDomain}/admin/api/2024-01/products.json?limit=250`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['X-Shopify-Access-Token'] = token;

    const resp = await fetch(adminUrl, { headers });
    if (resp.ok) {
      const data = await resp.json();
      rawProducts = data.products || [];
    } else {
      const pubResp = await fetch(`https://${cleanDomain}/products.json?limit=250`);
      if (pubResp.ok) {
        const pubData = await pubResp.json();
        rawProducts = pubData.products || [];
      }
    }

    return rawProducts.map((p) => {
      const plainText = (p.body_html || p.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const images = (p.images || []).map((img: any) => ({
        url: typeof img === 'string' ? img : (img.src || img.url || ''),
        alt: typeof img === 'string' ? '' : (img.alt || img.alt_text || ''),
      }));

      const inventory = (p.variants || []).reduce((acc: number, v: any) => acc + (Number(v.inventory_quantity) || 0), 0);

      return {
        id: `${store.id}_${p.id || p.handle}`,
        externalProductId: String(p.id || p.handle),
        title: p.title || 'Sin título',
        handle: p.handle || '',
        vendor: p.vendor || '',
        productType: p.product_type || p.type || '',
        descriptionHtml: p.body_html || '',
        descriptionText: plainText,
        currentMetaTitle: p.meta_title || p.title || '',
        currentMetaDescription: p.meta_description || plainText.slice(0, 160),
        canonicalUrl: `https://${cleanDomain}/products/${p.handle || ''}`,
        inventoryQuantity: inventory,
        images,
        variants: p.variants || [],
        tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags) : [],
      };
    });
  }

  public async syncProduct(
    store: typeof storeConnections.$inferSelect,
    decryptedTokens: { accessToken?: string },
    payload: ProductSyncPayload
  ): Promise<SyncResult> {
    const cleanDomain = this.sanitizeDomain(store.shopDomain || store.storeUrl);
    const token = decryptedTokens.accessToken || store.apiKey;

    if (!token) {
      return {
        success: false,
        platform: 'shopify',
        syncedVia: 'Shopify REST API',
        message: 'No se puede sincronizar con Shopify sin un Access Token válido con permisos write_products.',
        updatedFields: [],
        error: 'Missing access token',
      };
    }

    const url = `https://${cleanDomain}/admin/api/2024-01/products/${payload.externalProductId}.json`;
    const updateBody: any = {
      product: {
        id: payload.externalProductId,
      },
    };

    const updatedFields: string[] = [];
    if (payload.title) {
      updateBody.product.title = payload.title;
      updatedFields.push('title');
    }
    if (payload.metaTitle) {
      updateBody.product.metafields_global_title_tag = payload.metaTitle;
      updatedFields.push('metafields_global_title_tag');
    }
    if (payload.metaDescription) {
      updateBody.product.metafields_global_description_tag = payload.metaDescription;
      updatedFields.push('metafields_global_description_tag');
    }
    if (payload.descriptionHtml) {
      updateBody.product.body_html = payload.descriptionHtml;
      updatedFields.push('body_html');
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        platform: 'shopify',
        syncedVia: 'Shopify Admin REST API',
        message: `Error al actualizar producto en Shopify (${response.status}): ${errText}`,
        updatedFields: [],
        error: errText,
      };
    }

    const resData = await response.json();
    return {
      success: true,
      platform: 'shopify',
      syncedVia: 'Shopify Admin REST API (PUT /products/:id)',
      message: `Producto actualizado correctamente en Shopify: ${updatedFields.join(', ')}`,
      updatedFields,
      rawResponse: resData,
    };
  }

  public async checkHealth(store: typeof storeConnections.$inferSelect, decryptedTokens: { accessToken?: string }): Promise<HealthCheckResult> {
    const start = Date.now();
    const cleanDomain = this.sanitizeDomain(store.shopDomain || store.storeUrl);
    const token = decryptedTokens.accessToken || store.apiKey;

    try {
      const url = `https://${cleanDomain}/admin/api/2024-01/shop.json`;
      const resp = await fetch(url, {
        headers: { 'X-Shopify-Access-Token': token || '', 'Content-Type': 'application/json' },
      });

      const latencyMs = Date.now() - start;
      if (resp.ok) {
        return {
          healthy: true,
          status: 'healthy',
          latencyMs,
          message: `Conexión con Shopify activa (${latencyMs}ms)`,
          checkedAt: new Date().toISOString(),
        };
      }
      return {
        healthy: false,
        status: resp.status === 401 || resp.status === 403 ? 'unauthorized' : 'degraded',
        latencyMs,
        message: `Shopify respondió con código ${resp.status}`,
        checkedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        healthy: false,
        status: 'error',
        latencyMs: Date.now() - start,
        message: `Error de red con Shopify: ${err.message}`,
        checkedAt: new Date().toISOString(),
      };
    }
  }
}

// ==========================================
// 2. WOOCOMMERCE UNIFIED CONNECTOR
// ==========================================

export class WooCommerceConnectorAdapter implements IEcommerceStoreConnector {
  public readonly platform: SupportedPlatform = 'woocommerce';

  public sanitizeUrl(url: string): string {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  public async validateCredentials(credentials: StoreCredentialsInput): Promise<ConnectionValidationResult> {
    const start = Date.now();
    const cleanUrl = this.sanitizeUrl(credentials.url);
    const key = credentials.apiKey?.trim() || '';
    const secret = credentials.apiSecret?.trim() || '';

    if (!cleanUrl) {
      return {
        valid: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        storeName: 'WooCommerce',
        scopesGranted: [],
        connectionMethod: 'WooCommerce REST API v3',
        latencyMs: Date.now() - start,
        meta: {},
        error: 'La URL de la tienda WooCommerce es obligatoria.',
      };
    }

    if (!key || !secret) {
      return {
        valid: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        storeName: 'WooCommerce',
        scopesGranted: [],
        connectionMethod: 'WooCommerce REST API v3',
        latencyMs: Date.now() - start,
        meta: {},
        error: 'Consumer Key y Consumer Secret son obligatorios para conectar WooCommerce.',
      };
    }

    const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
    const endpoint = `${cleanUrl}/wp-json/wc/v3/system_status`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      const latencyMs = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        const siteTitle = data.environment?.site_title || cleanUrl.replace(/^https?:\/\//, '').split('.')[0].toUpperCase();

        return {
          valid: true,
          platform: 'woocommerce',
          storeUrl: cleanUrl,
          storeName: `${siteTitle} (WooCommerce)`,
          scopesGranted: ['read_products', 'write_products', 'read_orders', 'read_system_status'],
          connectionMethod: 'WooCommerce REST API v3 (Basic Auth)',
          latencyMs,
          platformVersion: `WooCommerce ${data.environment?.version || 'v3'} / WordPress ${data.environment?.wp_version || '6.x'}`,
          meta: {
            currency: data.settings?.currency || 'EUR',
            timezone: data.settings?.timezone || 'UTC',
            totalProducts: data.database?.total_products || 0,
            wpVersion: data.environment?.wp_version,
            wcVersion: data.environment?.version,
          },
        };
      }

      // Secondary fallback endpoint: /wp-json/wc/v3/products?per_page=1
      const prodEndpoint = `${cleanUrl}/wp-json/wc/v3/products?per_page=1`;
      const prodResp = await fetch(prodEndpoint, {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      });

      if (prodResp.ok) {
        const siteName = cleanUrl.replace(/^https?:\/\//, '').split('.')[0].toUpperCase();
        return {
          valid: true,
          platform: 'woocommerce',
          storeUrl: cleanUrl,
          storeName: `${siteName} (WooCommerce)`,
          scopesGranted: ['read_products', 'write_products'],
          connectionMethod: 'WooCommerce REST API v3 (Products Endpoint)',
          latencyMs: Date.now() - start,
          platformVersion: 'WooCommerce REST API v3',
          meta: { currency: 'EUR', timezone: 'UTC' },
        };
      }

      return {
        valid: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        storeName: cleanUrl,
        scopesGranted: [],
        connectionMethod: 'WooCommerce REST API v3',
        latencyMs: Date.now() - start,
        meta: {},
        error: `Fallo de autenticación WooCommerce (${response.status}): Verifique el Consumer Key y Consumer Secret.`,
      };
    } catch (err: any) {
      return {
        valid: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        storeName: cleanUrl,
        scopesGranted: [],
        connectionMethod: 'WooCommerce REST API v3',
        latencyMs: Date.now() - start,
        meta: {},
        error: `No se pudo conectar con el servidor WooCommerce: ${err.message}`,
      };
    }
  }

  public async fetchStoreMetadata(store: typeof storeConnections.$inferSelect, decryptedTokens: { apiKey?: string; apiSecret?: string }): Promise<any> {
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const secret = decryptedTokens.apiSecret || store.apiSecret;
    const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

    const response = await fetch(`${cleanUrl}/wp-json/wc/v3/system_status`, {
      headers: { Authorization: authHeader },
    });

    if (response.ok) return await response.json();
    return { name: store.storeName, url: cleanUrl };
  }

  public async fetchCatalog(store: typeof storeConnections.$inferSelect, decryptedTokens: { apiKey?: string; apiSecret?: string }): Promise<UnifiedProductRecord[]> {
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const secret = decryptedTokens.apiSecret || store.apiSecret;
    const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

    const response = await fetch(`${cleanUrl}/wp-json/wc/v3/products?per_page=100`, {
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce catalog fetch failed with status [${response.status}]`);
    }

    const rawProducts = await response.json();
    return rawProducts.map((p: any) => {
      const plainText = (p.description || p.short_description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const images = (p.images || []).map((img: any) => ({
        url: typeof img === 'string' ? img : (img.src || img.url || ''),
        alt: typeof img === 'string' ? '' : (img.alt || img.name || ''),
      }));

      // Extract Yoast / RankMath SEO meta if present
      const metaArray = Array.isArray(p.meta_data) ? p.meta_data : [];
      const yoastTitle = metaArray.find((m: any) => m.key === '_yoast_wpseo_title')?.value;
      const yoastDesc = metaArray.find((m: any) => m.key === '_yoast_wpseo_metadesc')?.value;
      const rankMathTitle = metaArray.find((m: any) => m.key === 'rank_math_title')?.value;
      const rankMathDesc = metaArray.find((m: any) => m.key === 'rank_math_description')?.value;

      return {
        id: `${store.id}_${p.id}`,
        externalProductId: String(p.id),
        title: p.name || 'Sin título',
        handle: p.slug || '',
        vendor: p.categories?.map((c: any) => c.name).join(', ') || 'WooCommerce',
        productType: p.type || 'simple',
        descriptionHtml: p.description || '',
        descriptionText: plainText,
        currentMetaTitle: yoastTitle || rankMathTitle || p.name || '',
        currentMetaDescription: yoastDesc || rankMathDesc || plainText.slice(0, 160),
        canonicalUrl: p.permalink || `${cleanUrl}/product/${p.slug || ''}`,
        inventoryQuantity: p.stock_quantity !== null && p.stock_quantity !== undefined ? Number(p.stock_quantity) : 0,
        images,
        variants: p.variations || [],
        tags: (p.tags || []).map((t: any) => t.name || t),
      };
    });
  }

  public async syncProduct(
    store: typeof storeConnections.$inferSelect,
    decryptedTokens: { apiKey?: string; apiSecret?: string },
    payload: ProductSyncPayload
  ): Promise<SyncResult> {
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const secret = decryptedTokens.apiSecret || store.apiSecret;
    const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

    const updateBody: any = {};
    const updatedFields: string[] = [];

    if (payload.title) {
      updateBody.name = payload.title;
      updatedFields.push('name');
    }
    if (payload.descriptionHtml) {
      updateBody.description = payload.descriptionHtml;
      updatedFields.push('description');
    }

    const metaDataUpdates: Array<{ key: string; value: string }> = [];
    if (payload.metaTitle) {
      metaDataUpdates.push({ key: '_yoast_wpseo_title', value: payload.metaTitle });
      metaDataUpdates.push({ key: 'rank_math_title', value: payload.metaTitle });
      updatedFields.push('meta_title (Yoast/RankMath)');
    }
    if (payload.metaDescription) {
      metaDataUpdates.push({ key: '_yoast_wpseo_metadesc', value: payload.metaDescription });
      metaDataUpdates.push({ key: 'rank_math_description', value: payload.metaDescription });
      updatedFields.push('meta_description (Yoast/RankMath)');
    }

    if (metaDataUpdates.length > 0) {
      updateBody.meta_data = metaDataUpdates;
    }

    const response = await fetch(`${cleanUrl}/wp-json/wc/v3/products/${payload.externalProductId}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        platform: 'woocommerce',
        syncedVia: 'WooCommerce REST API v3',
        message: `Error al actualizar producto en WooCommerce (${response.status}): ${errText}`,
        updatedFields: [],
        error: errText,
      };
    }

    const resData = await response.json();
    return {
      success: true,
      platform: 'woocommerce',
      syncedVia: 'WooCommerce REST API v3 (PUT /wp-json/wc/v3/products/:id)',
      message: `Producto actualizado en WooCommerce: ${updatedFields.join(', ')}`,
      updatedFields,
      rawResponse: resData,
    };
  }

  public async checkHealth(store: typeof storeConnections.$inferSelect, decryptedTokens: { apiKey?: string; apiSecret?: string }): Promise<HealthCheckResult> {
    const start = Date.now();
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const secret = decryptedTokens.apiSecret || store.apiSecret;
    const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

    try {
      const resp = await fetch(`${cleanUrl}/wp-json/wc/v3/products?per_page=1`, {
        headers: { Authorization: authHeader },
      });
      const latencyMs = Date.now() - start;

      if (resp.ok) {
        return {
          healthy: true,
          status: 'healthy',
          latencyMs,
          message: `Conexión con WooCommerce activa (${latencyMs}ms)`,
          checkedAt: new Date().toISOString(),
        };
      }
      return {
        healthy: false,
        status: resp.status === 401 || resp.status === 403 ? 'unauthorized' : 'degraded',
        latencyMs,
        message: `WooCommerce respondió con estado ${resp.status}`,
        checkedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        healthy: false,
        status: 'error',
        latencyMs: Date.now() - start,
        message: `Error de conexión con WooCommerce: ${err.message}`,
        checkedAt: new Date().toISOString(),
      };
    }
  }
}

// ==========================================
// 3. PRESTASHOP UNIFIED CONNECTOR
// ==========================================

export class PrestaShopConnectorAdapter implements IEcommerceStoreConnector {
  public readonly platform: SupportedPlatform = 'prestashop';

  public sanitizeUrl(url: string): string {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  public async validateCredentials(credentials: StoreCredentialsInput): Promise<ConnectionValidationResult> {
    const start = Date.now();
    const cleanUrl = this.sanitizeUrl(credentials.url);
    const key = credentials.apiKey?.trim() || '';

    if (!cleanUrl) {
      return {
        valid: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        storeName: 'PrestaShop',
        scopesGranted: [],
        connectionMethod: 'PrestaShop Webservice API',
        latencyMs: Date.now() - start,
        meta: {},
        error: 'La URL de la tienda PrestaShop es obligatoria.',
      };
    }

    if (!key) {
      return {
        valid: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        storeName: 'PrestaShop',
        scopesGranted: [],
        connectionMethod: 'PrestaShop Webservice API',
        latencyMs: Date.now() - start,
        meta: {},
        error: 'La clave de Webservice API Key de PrestaShop es obligatoria.',
      };
    }

    const authHeader = 'Basic ' + Buffer.from(`${key}:`).toString('base64');
    const endpoint = `${cleanUrl}/api/products?output_format=JSON&limit=1`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: authHeader,
          Output_Format: 'JSON',
        },
      });

      const latencyMs = Date.now() - start;

      if (response.ok) {
        const cleanHost = cleanUrl.replace(/^https?:\/\//, '').split('.')[0].toUpperCase();
        return {
          valid: true,
          platform: 'prestashop',
          storeUrl: cleanUrl,
          storeName: `${cleanHost} (PrestaShop)`,
          scopesGranted: ['read_products', 'write_products', 'read_categories'],
          connectionMethod: 'PrestaShop Webservice API (API Key)',
          latencyMs,
          platformVersion: 'PrestaShop Webservice 8.x / 1.7.x',
          meta: {
            currency: 'EUR',
            timezone: 'Europe/Madrid',
          },
        };
      }

      return {
        valid: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        storeName: cleanUrl,
        scopesGranted: [],
        connectionMethod: 'PrestaShop Webservice API',
        latencyMs: Date.now() - start,
        meta: {},
        error: `Fallo de conexión con PrestaShop (${response.status}): Verifique la API Key y los permisos de Webservice en Parámetros Avanzados.`,
      };
    } catch (err: any) {
      return {
        valid: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        storeName: cleanUrl,
        scopesGranted: [],
        connectionMethod: 'PrestaShop Webservice API',
        latencyMs: Date.now() - start,
        meta: {},
        error: `Error al conectar con PrestaShop: ${err.message}`,
      };
    }
  }

  public async fetchStoreMetadata(store: typeof storeConnections.$inferSelect): Promise<any> {
    return { name: store.storeName, url: store.storeUrl, platform: 'PrestaShop' };
  }

  public async fetchCatalog(store: typeof storeConnections.$inferSelect, decryptedTokens: { apiKey?: string }): Promise<UnifiedProductRecord[]> {
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const authHeader = 'Basic ' + Buffer.from(`${key}:`).toString('base64');

    const endpoint = `${cleanUrl}/api/products?output_format=JSON&display=full`;
    const response = await fetch(endpoint, {
      headers: { Authorization: authHeader, Output_Format: 'JSON' },
    });

    if (!response.ok) {
      throw new Error(`PrestaShop catalog fetch failed with status [${response.status}]`);
    }

    const data = await response.json();
    const rawProducts = data.products || [];

    return rawProducts.map((p: any) => {
      const getLangVal = (val: any) => {
        if (typeof val === 'string') return val;
        if (Array.isArray(val) && val.length > 0) return val[0].value || val[0]['#text'] || '';
        if (val && typeof val === 'object') return val.value || val['#text'] || '';
        return '';
      };

      const title = getLangVal(p.name) || 'Sin título';
      const descriptionHtml = getLangVal(p.description) || getLangVal(p.description_short) || '';
      const descriptionText = descriptionHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const metaTitle = getLangVal(p.meta_title) || title;
      const metaDescription = getLangVal(p.meta_description) || descriptionText.slice(0, 160);
      const linkRewrite = getLangVal(p.link_rewrite) || 'producto';

      return {
        id: `${store.id}_${p.id}`,
        externalProductId: String(p.id),
        title,
        handle: linkRewrite,
        vendor: p.manufacturer_name || 'PrestaShop',
        productType: 'standard',
        descriptionHtml,
        descriptionText,
        currentMetaTitle: metaTitle,
        currentMetaDescription: metaDescription,
        canonicalUrl: `${cleanUrl}/${p.id}-${linkRewrite}.html`,
        inventoryQuantity: Number(p.quantity) || 0,
        images: [],
        variants: [],
        tags: [],
      };
    });
  }

  public async syncProduct(
    store: typeof storeConnections.$inferSelect,
    decryptedTokens: { apiKey?: string },
    payload: ProductSyncPayload
  ): Promise<SyncResult> {
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const authHeader = 'Basic ' + Buffer.from(`${key}:`).toString('base64');

    const updatedFields: string[] = [];
    if (payload.metaTitle) updatedFields.push('meta_title');
    if (payload.metaDescription) updatedFields.push('meta_description');

    // PrestaShop XML payload for updating metadata
    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <id>${payload.externalProductId}</id>
    ${payload.metaTitle ? `<meta_title><language id="1">${payload.metaTitle}</language></meta_title>` : ''}
    ${payload.metaDescription ? `<meta_description><language id="1">${payload.metaDescription}</language></meta_description>` : ''}
  </product>
</prestashop>`;

    const response = await fetch(`${cleanUrl}/api/products/${payload.externalProductId}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'text/xml',
      },
      body: xmlPayload,
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        platform: 'prestashop',
        syncedVia: 'PrestaShop Webservice API',
        message: `Error al actualizar producto en PrestaShop (${response.status}): ${errText}`,
        updatedFields: [],
        error: errText,
      };
    }

    return {
      success: true,
      platform: 'prestashop',
      syncedVia: 'PrestaShop Webservice XML API (PUT /api/products/:id)',
      message: `Producto actualizado en PrestaShop: ${updatedFields.join(', ')}`,
      updatedFields,
    };
  }

  public async checkHealth(store: typeof storeConnections.$inferSelect, decryptedTokens: { apiKey?: string }): Promise<HealthCheckResult> {
    const start = Date.now();
    const cleanUrl = this.sanitizeUrl(store.storeUrl);
    const key = decryptedTokens.apiKey || store.apiKey;
    const authHeader = 'Basic ' + Buffer.from(`${key}:`).toString('base64');

    try {
      const resp = await fetch(`${cleanUrl}/api/products?output_format=JSON&limit=1`, {
        headers: { Authorization: authHeader },
      });
      const latencyMs = Date.now() - start;

      if (resp.ok) {
        return {
          healthy: true,
          status: 'healthy',
          latencyMs,
          message: `Conexión con PrestaShop activa (${latencyMs}ms)`,
          checkedAt: new Date().toISOString(),
        };
      }
      return {
        healthy: false,
        status: resp.status === 401 || resp.status === 403 ? 'unauthorized' : 'degraded',
        latencyMs,
        message: `PrestaShop respondió con estado ${resp.status}`,
        checkedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        healthy: false,
        status: 'error',
        latencyMs: Date.now() - start,
        message: `Error de conexión con PrestaShop: ${err.message}`,
        checkedAt: new Date().toISOString(),
      };
    }
  }
}

// ==========================================
// CENTRALIZED STORE CONNECTOR SERVICE
// ==========================================

export class StoreConnectorService {
  private connectors: Map<SupportedPlatform, IEcommerceStoreConnector> = new Map();

  constructor() {
    this.registerConnector(new ShopifyConnectorAdapter());
    this.registerConnector(new WooCommerceConnectorAdapter());
    this.registerConnector(new PrestaShopConnectorAdapter());
  }

  public registerConnector(connector: IEcommerceStoreConnector) {
    this.connectors.set(connector.platform, connector);
  }

  public getConnector(platform: SupportedPlatform): IEcommerceStoreConnector {
    const connector = this.connectors.get(platform);
    if (!connector) {
      throw new Error(`Plataforma e-commerce no soportada: '${platform}'`);
    }
    return connector;
  }

  /**
   * Unified Connection Validation & Registration in PostgreSQL
   */
  public async validateAndConnectStore(credentials: StoreCredentialsInput): Promise<{
    success: boolean;
    validation: ConnectionValidationResult;
    store?: typeof storeConnections.$inferSelect;
    metadata?: typeof storeMetadata.$inferSelect;
    error?: string;
  }> {
    const startTime = Date.now();
    const connector = this.getConnector(credentials.platform);

    // 1. Validate credentials via unified connector
    const validation = await connector.validateCredentials(credentials);
    if (!validation.valid) {
      return {
        success: false,
        validation,
        error: validation.error || 'Credenciales inválidas o servidor inalcanzable.',
      };
    }

    // 2. Encrypt sensitive tokens with AES-256-GCM
    const encryptedAccessToken = credentials.accessToken ? encryptToken(credentials.accessToken) : null;
    const encryptedApiSecret = credentials.apiSecret ? encryptToken(credentials.apiSecret) : null;
    const encryptedWebhookSecret = credentials.webhookSecret ? encryptToken(credentials.webhookSecret) : null;

    const storeId = `store_${credentials.platform}_${(credentials.shopDomain || credentials.url).replace(/[^a-zA-Z0-9]/g, '_')}`;

    // 3. Upsert store_connections in PostgreSQL
    const existing = await db.select().from(storeConnections).where(eq(storeConnections.id, storeId));

    let storeRecord: typeof storeConnections.$inferSelect;
    if (existing.length > 0) {
      const [updated] = await db
        .update(storeConnections)
        .set({
          storeName: validation.storeName,
          storeUrl: validation.storeUrl,
          shopDomain: validation.shopDomain || null,
          accessToken: encryptedAccessToken || existing[0].accessToken,
          apiKey: credentials.apiKey || existing[0].apiKey,
          apiSecret: encryptedApiSecret || existing[0].apiSecret,
          webhookSecret: encryptedWebhookSecret || existing[0].webhookSecret,
          scopes: validation.scopesGranted.join(','),
          status: 'connected',
          connectionMethod: validation.connectionMethod,
          latencyMs: validation.latencyMs,
          lastSyncAt: new Date(),
          meta: {
            ...((existing[0].meta as any) || {}),
            ...validation.meta,
          },
          updatedAt: new Date(),
        })
        .where(eq(storeConnections.id, storeId))
        .returning();

      storeRecord = updated;
    } else {
      const [inserted] = await db
        .insert(storeConnections)
        .values({
          id: storeId,
          userId: credentials.userId || null,
          platform: credentials.platform,
          storeName: validation.storeName,
          storeUrl: validation.storeUrl,
          shopDomain: validation.shopDomain || null,
          accessToken: encryptedAccessToken,
          apiKey: credentials.apiKey || null,
          apiSecret: encryptedApiSecret,
          webhookSecret: encryptedWebhookSecret,
          scopes: validation.scopesGranted.join(','),
          status: 'connected',
          connectionMethod: validation.connectionMethod,
          latencyMs: validation.latencyMs,
          installedAt: new Date(),
          lastSyncAt: new Date(),
          meta: validation.meta,
        })
        .returning();

      storeRecord = inserted;
    }

    // 4. Upsert store_metadata in PostgreSQL
    const metaId = `${storeId}_meta`;
    const [metadataRecord] = await db
      .insert(storeMetadata)
      .values({
        id: metaId,
        storeId: storeRecord.id,
        platform: storeRecord.platform,
        platformVersion: validation.platformVersion || 'Standard API',
        storeEmail: validation.meta.email || null,
        currency: validation.meta.currency || 'EUR',
        currencySymbol: validation.meta.currency === 'USD' ? '$' : '€',
        timezone: validation.meta.timezone || 'UTC',
        ianaTimezone: validation.meta.timezone || 'UTC',
        countryCode: validation.meta.country || 'ES',
        planName: validation.meta.plan || 'standard',
        healthStatus: 'healthy',
        lastHealthCheckAt: new Date(),
        healthCheckLatencyMs: validation.latencyMs,
        healthDetails: validation.meta,
        totalProductsCount: validation.meta.totalProducts || 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeMetadata.id,
        set: {
          platformVersion: validation.platformVersion || 'Standard API',
          storeEmail: validation.meta.email || null,
          currency: validation.meta.currency || 'EUR',
          timezone: validation.meta.timezone || 'UTC',
          healthStatus: 'healthy',
          lastHealthCheckAt: new Date(),
          healthCheckLatencyMs: validation.latencyMs,
          healthDetails: validation.meta,
          totalProductsCount: validation.meta.totalProducts || 0,
          updatedAt: new Date(),
        },
      })
      .returning();

    // 5. Log synchronization event in ecommerce_sync_logs
    const syncLogId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(ecommerceSyncLogs).values({
      id: syncLogId,
      storeId: storeRecord.id,
      platform: storeRecord.platform,
      syncType: 'oauth_handshake',
      status: 'completed',
      itemsProcessed: 1,
      itemsSucceeded: 1,
      itemsFailed: 0,
      payloadSummary: {
        connectionMethod: validation.connectionMethod,
        scopes: validation.scopesGranted,
        latencyMs: validation.latencyMs,
      },
      executionTimeMs: Date.now() - startTime,
      initiatedBy: 'manual_merchant',
      startedAt: new Date(startTime),
      completedAt: new Date(),
    });

    return {
      success: true,
      validation,
      store: storeRecord,
      metadata: metadataRecord,
    };
  }

  /**
   * Unified Catalog Extraction from any platform with decrypted tokens
   */
  public async extractCatalog(storeId: string): Promise<{
    store: typeof storeConnections.$inferSelect;
    products: UnifiedProductRecord[];
    syncLog: typeof ecommerceSyncLogs.$inferSelect;
  }> {
    const startTime = Date.now();
    const stores = await db.select().from(storeConnections).where(eq(storeConnections.id, storeId));
    if (!stores.length) {
      throw new Error(`Tienda '${storeId}' no encontrada en la base de datos.`);
    }

    const store = stores[0];
    const connector = this.getConnector(store.platform as SupportedPlatform);

    // Decrypt credentials
    const decryptedTokens = {
      accessToken: store.accessToken ? decryptToken(store.accessToken) : undefined,
      apiKey: store.apiKey || undefined,
      apiSecret: store.apiSecret ? decryptToken(store.apiSecret) : undefined,
    };

    let products: UnifiedProductRecord[] = [];
    let status = 'completed';
    let errorDetails: any = {};

    try {
      products = await connector.fetchCatalog(store, decryptedTokens);
    } catch (err: any) {
      status = 'failed';
      errorDetails = { message: err.message, stack: err.stack };
      throw err;
    } finally {
      const syncLogId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const [syncLog] = await db
        .insert(ecommerceSyncLogs)
        .values({
          id: syncLogId,
          storeId: store.id,
          platform: store.platform,
          syncType: 'catalog_scan',
          status: status as any,
          itemsProcessed: products.length,
          itemsSucceeded: status === 'completed' ? products.length : 0,
          itemsFailed: status === 'failed' ? 1 : 0,
          payloadSummary: { totalExtracted: products.length },
          errorDetails,
          executionTimeMs: Date.now() - startTime,
          initiatedBy: 'manual_merchant',
          startedAt: new Date(startTime),
          completedAt: new Date(),
        })
        .returning();

      return { store, products, syncLog };
    }
  }

  /**
   * Unified Product Sync to Live Ecommerce Store with decrypted tokens
   */
  public async syncProduct(storeId: string, payload: ProductSyncPayload): Promise<{
    syncResult: SyncResult;
    syncLog: typeof ecommerceSyncLogs.$inferSelect;
  }> {
    const startTime = Date.now();
    const stores = await db.select().from(storeConnections).where(eq(storeConnections.id, storeId));
    if (!stores.length) {
      throw new Error(`Tienda '${storeId}' no encontrada.`);
    }

    const store = stores[0];
    const connector = this.getConnector(store.platform as SupportedPlatform);

    const decryptedTokens = {
      accessToken: store.accessToken ? decryptToken(store.accessToken) : undefined,
      apiKey: store.apiKey || undefined,
      apiSecret: store.apiSecret ? decryptToken(store.apiSecret) : undefined,
    };

    const syncResult = await connector.syncProduct(store, decryptedTokens, payload);

    // Record in sync logs
    const syncLogId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [syncLog] = await db
      .insert(ecommerceSyncLogs)
      .values({
        id: syncLogId,
        storeId: store.id,
        platform: store.platform,
        syncType: 'product_sync',
        status: syncResult.success ? 'completed' : 'failed',
        itemsProcessed: 1,
        itemsSucceeded: syncResult.success ? 1 : 0,
        itemsFailed: syncResult.success ? 0 : 1,
        payloadSummary: {
          productId: payload.externalProductId,
          updatedFields: syncResult.updatedFields,
          syncedVia: syncResult.syncedVia,
        },
        errorDetails: syncResult.error ? { error: syncResult.error } : {},
        executionTimeMs: Date.now() - startTime,
        initiatedBy: 'ai_optimizer',
        startedAt: new Date(startTime),
        completedAt: new Date(),
      })
      .returning();

    return { syncResult, syncLog };
  }

  /**
   * Performs Health Check and logs metrics
   */
  public async checkStoreHealth(storeId: string): Promise<HealthCheckResult> {
    const stores = await db.select().from(storeConnections).where(eq(storeConnections.id, storeId));
    if (!stores.length) {
      throw new Error(`Tienda '${storeId}' no encontrada.`);
    }

    const store = stores[0];
    const connector = this.getConnector(store.platform as SupportedPlatform);

    const decryptedTokens = {
      accessToken: store.accessToken ? decryptToken(store.accessToken) : undefined,
      apiKey: store.apiKey || undefined,
      apiSecret: store.apiSecret ? decryptToken(store.apiSecret) : undefined,
    };

    const health = await connector.checkHealth(store, decryptedTokens);

    // Update store metadata table
    await db
      .update(storeMetadata)
      .set({
        healthStatus: health.status,
        lastHealthCheckAt: new Date(),
        healthCheckLatencyMs: health.latencyMs,
        updatedAt: new Date(),
      })
      .where(eq(storeMetadata.storeId, storeId));

    return health;
  }

  /**
   * Retrieves synchronization logs from PostgreSQL
   */
  public async getSyncLogs(storeId?: string, limit: number = 50) {
    if (storeId) {
      return await db
        .select()
        .from(ecommerceSyncLogs)
        .where(eq(ecommerceSyncLogs.storeId, storeId))
        .orderBy(desc(ecommerceSyncLogs.startedAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(ecommerceSyncLogs)
      .orderBy(desc(ecommerceSyncLogs.startedAt))
      .limit(limit);
  }
}

export const storeConnectorService = new StoreConnectorService();
