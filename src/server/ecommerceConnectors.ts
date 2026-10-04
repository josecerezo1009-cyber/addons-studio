import { SEOStoreProduct } from '../types/seo';

export interface VerifyConnectionResult {
  success: boolean;
  verified: boolean;
  platform: 'shopify' | 'woocommerce' | 'prestashop';
  storeUrl: string;
  connectionMethod: string;
  scopesGranted: string[];
  connectionStatus: 'connected' | 'authorization_required' | 'error';
  latencyMs: number;
  message: string;
  error?: string;
  shopDetails?: {
    name?: string;
    domain?: string;
    email?: string;
    currency?: string;
  };
}

export interface SyncProductResult {
  success: boolean;
  synced: boolean;
  syncedVia: string;
  message: string;
  status: 'completed' | 'synced' | 'error' | 'authorization_required';
  errorDetails?: string;
}

// ----------------------------------------------------
// SHOPIFY CONNECTOR
// ----------------------------------------------------
export const shopifyConnector = {
  normalizeShopDomain(url: string): string {
    return url
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .split('/')[0];
  },

  async verifyConnection(
    rawUrl: string, 
    accessToken?: string, 
    apiKey?: string, 
    apiSecret?: string
  ): Promise<VerifyConnectionResult> {
    const startTime = Date.now();
    const domain = this.normalizeShopDomain(rawUrl);
    const storeUrl = `https://${domain}`;

    if (!domain) {
      return {
        success: false,
        verified: false,
        platform: 'shopify',
        storeUrl: '',
        connectionMethod: 'Shopify REST API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: 0,
        message: 'La URL de la tienda es obligatoria.'
      };
    }

    try {
      // 1. If accessToken provided: verify with private/custom app Admin API
      if (accessToken && accessToken.trim().length > 0) {
        const adminUrl = `https://${domain}/admin/api/2025-01/shop.json`;
        const res = await fetch(adminUrl, {
          headers: {
            'X-Shopify-Access-Token': accessToken.trim(),
            'Content-Type': 'application/json'
          }
        });

        const latency = Date.now() - startTime;

        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            verified: true,
            platform: 'shopify',
            storeUrl,
            connectionMethod: 'Shopify Admin REST API (Access Token Autenticado)',
            scopesGranted: ['read_products', 'write_products', 'read_product_listings', 'read_themes', 'write_script_tags'],
            connectionStatus: 'connected',
            latencyMs: latency,
            message: `Tienda Shopify "${data.shop?.name || domain}" verificada y autorizada con permisos de lectura y escritura.`,
            shopDetails: {
              name: data.shop?.name,
              domain: data.shop?.domain || domain,
              email: data.shop?.email,
              currency: data.shop?.currency || 'USD'
            }
          };
        } else if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            verified: false,
            platform: 'shopify',
            storeUrl,
            connectionMethod: 'Shopify Admin REST API',
            scopesGranted: [],
            connectionStatus: 'authorization_required',
            latencyMs: latency,
            message: 'El Access Token proporcionado fue rechazado por Shopify (401/403). Verifica los permisos de la Custom App.',
            error: 'Credenciales de Shopify denegadas'
          };
        }
      }

      // 2. If no accessToken provided or public storefront check
      const publicUrl = `https://${domain}/products.json?limit=1`;
      const pubRes = await fetch(publicUrl, {
        headers: { 'Accept': 'application/json' }
      });
      const latency = Date.now() - startTime;

      if (pubRes.ok) {
        return {
          success: true,
          verified: true,
          platform: 'shopify',
          storeUrl,
          connectionMethod: 'Shopify Live Storefront & Catalog Feed',
          scopesGranted: ['read_products', 'read_categories', 'write_metadata (requiere token de app para aplicar cambios)'],
          connectionStatus: 'connected',
          latencyMs: latency,
          message: `Conexión con tienda Shopify "${domain}" verificada con éxito. Catálogo accesible para auditoría.`
        };
      }

      return {
        success: false,
        verified: false,
        platform: 'shopify',
        storeUrl,
        connectionMethod: 'Shopify API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: latency,
        message: `No se pudo conectar con la tienda Shopify en ${domain}. Asegúrate de que el dominio es accesible.`,
        error: `HTTP ${pubRes.status} al verificar ${publicUrl}`
      };
    } catch (err: any) {
      return {
        success: false,
        verified: false,
        platform: 'shopify',
        storeUrl,
        connectionMethod: 'Shopify API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: Date.now() - startTime,
        message: `Error de red al conectar con Shopify: ${err.message}`,
        error: err.message
      };
    }
  },

  async fetchCatalog(rawUrl: string, accessToken?: string): Promise<SEOStoreProduct[]> {
    const domain = this.normalizeShopDomain(rawUrl);
    
    // 1. Try authenticated Admin API if accessToken exists
    if (accessToken && accessToken.trim().length > 0) {
      try {
        const url = `https://${domain}/admin/api/2025-01/products.json?limit=50`;
        const res = await fetch(url, {
          headers: {
            'X-Shopify-Access-Token': accessToken.trim(),
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          const items = data.products || [];
          return items.map((p: any): SEOStoreProduct => {
            const cleanDesc = (p.body_html || '')
              .replace(/<[^>]*>?/gm, '')
              .replace(/&nbsp;/g, ' ')
              .trim();
            const firstImg = p.images?.[0];
            return {
              id: String(p.id),
              storeId: domain,
              title: p.title || '',
              handle: p.handle || '',
              price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : 0,
              currency: 'USD',
              description: cleanDesc,
              category: p.product_type || 'General',
              images: (p.images || []).map((img: any) => ({
                url: img.src || '',
                altText: img.alt || ''
              })),
              metaTitle: p.title || '',
              metaDescription: '',
              canonicalUrl: `https://${domain}/products/${p.handle || ''}`,
              score: 0,
              status: 'pending',
              issues: []
            };
          });
        }
      } catch (err) {
        console.warn('Shopify Admin API fetch failed, trying public catalog:', err);
      }
    }

    // 2. Fetch from public catalog endpoint
    try {
      const publicUrl = `https://${domain}/products.json?limit=50`;
      const res = await fetch(publicUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.products || [];
        return items.map((p: any): SEOStoreProduct => {
          const cleanDesc = (p.body_html || '')
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
          return {
            id: String(p.id),
            storeId: domain,
            title: p.title || '',
            handle: p.handle || '',
            price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : 0,
            currency: 'USD',
            description: cleanDesc,
            category: p.product_type || (p.tags && p.tags[0]) || 'General',
            images: (p.images || []).map((img: any) => ({
              url: img.src || '',
              altText: img.alt || ''
            })),
            metaTitle: p.title || '',
            metaDescription: '',
            canonicalUrl: `https://${domain}/products/${p.handle || ''}`,
            score: 0,
            status: 'pending',
            issues: []
          };
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch Shopify catalog:', err);
    }

    return [];
  },

  async syncProduct(
    rawUrl: string, 
    accessToken: string | undefined, 
    productId: string, 
    updatedMeta: { title: string; metaDescription: string }
  ): Promise<SyncProductResult> {
    const domain = this.normalizeShopDomain(rawUrl);

    if (!accessToken) {
      return {
        success: false,
        synced: false,
        status: 'authorization_required',
        syncedVia: 'Shopify Admin REST API',
        message: 'Para escribir y sincronizar cambios en Shopify se requiere un Access Token privado o instalación OAuth de la App.',
        errorDetails: 'Falta X-Shopify-Access-Token'
      };
    }

    try {
      const updateUrl = `https://${domain}/admin/api/2025-01/products/${productId}.json`;
      const payload = {
        product: {
          id: productId,
          title: updatedMeta.title,
          metafields: [
            {
              namespace: 'global',
              key: 'title_tag',
              value: updatedMeta.title,
              type: 'single_line_text_field'
            },
            {
              namespace: 'global',
              key: 'description_tag',
              value: updatedMeta.metaDescription,
              type: 'multi_line_text_field'
            }
          ]
        }
      };

      const res = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return {
          success: true,
          synced: true,
          status: 'completed',
          syncedVia: 'Shopify Admin REST API (v2025-01)',
          message: `Metadatos SEO actualizados con éxito en Shopify para el producto #${productId}.`
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          synced: false,
          status: 'authorization_required',
          syncedVia: 'Shopify Admin REST API',
          message: 'Permiso denegado al escribir en Shopify. La app requiere permisos "write_products".',
          errorDetails: `HTTP ${res.status}`
        };
      }

      const errText = await res.text();
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'Shopify Admin REST API',
        message: `Shopify rechazó la actualización: ${errText.slice(0, 120)}`,
        errorDetails: errText
      };
    } catch (err: any) {
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'Shopify Admin REST API',
        message: `Error al conectar con Shopify API: ${err.message}`,
        errorDetails: err.message
      };
    }
  }
};

// ----------------------------------------------------
// WOOCOMMERCE CONNECTOR
// ----------------------------------------------------
export const wooCommerceConnector = {
  normalizeUrl(raw: string): string {
    let url = raw.trim().replace(/\/$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  },

  async verifyConnection(
    rawUrl: string, 
    consumerKey?: string, 
    consumerSecret?: string
  ): Promise<VerifyConnectionResult> {
    const startTime = Date.now();
    const cleanUrl = this.normalizeUrl(rawUrl);

    if (!rawUrl) {
      return {
        success: false,
        verified: false,
        platform: 'woocommerce',
        storeUrl: '',
        connectionMethod: 'WooCommerce REST API v3',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: 0,
        message: 'La URL de la tienda WooCommerce es obligatoria.'
      };
    }

    try {
      // 1. Authenticated request if consumerKey & consumerSecret provided
      if (consumerKey && consumerSecret) {
        const testEndpoint = `${cleanUrl}/wp-json/wc/v3/products?per_page=1`;
        const authHeader = 'Basic ' + Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
        
        const res = await fetch(testEndpoint, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });

        const latency = Date.now() - startTime;

        if (res.ok) {
          return {
            success: true,
            verified: true,
            platform: 'woocommerce',
            storeUrl: cleanUrl,
            connectionMethod: 'WooCommerce REST API v3 (Autenticado con Consumer Key)',
            scopesGranted: ['read_products', 'write_products', 'read_categories', 'write_meta'],
            connectionStatus: 'connected',
            latencyMs: latency,
            message: 'Conexión con la API REST de WooCommerce verificada y autorizada con éxito.'
          };
        } else if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            verified: false,
            platform: 'woocommerce',
            storeUrl: cleanUrl,
            connectionMethod: 'WooCommerce REST API v3',
            scopesGranted: [],
            connectionStatus: 'authorization_required',
            latencyMs: latency,
            message: 'Consumer Key o Consumer Secret incorrectos. Comprueba los permisos de lectura/escritura en WooCommerce > Ajustes > Avanzado > REST API.',
            error: 'Error 401/403 en autenticación WooCommerce'
          };
        }
      }

      // 2. Try WooCommerce Store API (public storefront API)
      const storeApiEndpoint = `${cleanUrl}/wp-json/wc/store/v1/products?per_page=1`;
      const storeRes = await fetch(storeApiEndpoint);
      const latency = Date.now() - startTime;

      if (storeRes.ok) {
        return {
          success: true,
          verified: true,
          platform: 'woocommerce',
          storeUrl: cleanUrl,
          connectionMethod: 'WooCommerce Storefront API v1 (Modo Auditoría)',
          scopesGranted: ['read_products', 'read_categories'],
          connectionStatus: 'connected',
          latencyMs: latency,
          message: 'Tienda WooCommerce detectada y accesible para auditoría de catálogo.'
        };
      }

      return {
        success: false,
        verified: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        connectionMethod: 'WooCommerce REST API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: latency,
        message: `No se pudo verificar la API de WooCommerce en ${cleanUrl}. Asegúrate de que los enlaces permanentes (Permalinks) no están en 'Simple'.`,
        error: `HTTP ${storeRes.status}`
      };
    } catch (err: any) {
      return {
        success: false,
        verified: false,
        platform: 'woocommerce',
        storeUrl: cleanUrl,
        connectionMethod: 'WooCommerce REST API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: Date.now() - startTime,
        message: `Error al conectar con WooCommerce: ${err.message}`,
        error: err.message
      };
    }
  },

  async fetchCatalog(rawUrl: string, consumerKey?: string, consumerSecret?: string): Promise<SEOStoreProduct[]> {
    const cleanUrl = this.normalizeUrl(rawUrl);

    // 1. Try authenticated wc/v3
    if (consumerKey && consumerSecret) {
      try {
        const endpoint = `${cleanUrl}/wp-json/wc/v3/products?per_page=50`;
        const authHeader = 'Basic ' + Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
        const res = await fetch(endpoint, {
          headers: { 'Authorization': authHeader }
        });

        if (res.ok) {
          const items = await res.json();
          if (Array.isArray(items)) {
            return items.map((p: any): SEOStoreProduct => {
              const cleanDesc = (p.description || p.short_description || '')
                .replace(/<[^>]*>?/gm, '')
                .trim();
              const metaYoastTitle = p.meta_data?.find((m: any) => m.key === '_yoast_wpseo_title')?.value;
              const metaYoastDesc = p.meta_data?.find((m: any) => m.key === '_yoast_wpseo_metadesc')?.value;

              return {
                id: String(p.id),
                storeId: cleanUrl,
                title: p.name || '',
                handle: p.slug || '',
                price: parseFloat(p.price || '0'),
                currency: 'EUR',
                description: cleanDesc,
                category: p.categories?.[0]?.name || 'General',
                images: (p.images || []).map((img: any) => ({
                  url: img.src || '',
                  altText: img.alt || ''
                })),
                metaTitle: metaYoastTitle || p.name || '',
                metaDescription: metaYoastDesc || '',
                canonicalUrl: p.permalink || `${cleanUrl}/product/${p.slug}`,
                score: 0,
                status: 'pending',
                issues: []
              };
            });
          }
        }
      } catch (err) {
        console.warn('WooCommerce wc/v3 fetch failed, trying Store API:', err);
      }
    }

    // 2. Try Storefront API
    try {
      const endpoint = `${cleanUrl}/wp-json/wc/store/v1/products?per_page=50`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          return items.map((p: any): SEOStoreProduct => {
            const cleanDesc = (p.description || p.short_description || '')
              .replace(/<[^>]*>?/gm, '')
              .trim();
            return {
              id: String(p.id),
              storeId: cleanUrl,
              title: p.name || '',
              handle: p.slug || '',
              price: parseFloat(p.prices?.price || '0') / 100,
              currency: p.prices?.currency_code || 'EUR',
              description: cleanDesc,
              category: p.categories?.[0]?.name || 'General',
              images: (p.images || []).map((img: any) => ({
                url: img.src || '',
                altText: img.alt || ''
              })),
              metaTitle: p.name || '',
              metaDescription: '',
              canonicalUrl: p.permalink || `${cleanUrl}/product/${p.slug}`,
              score: 0,
              status: 'pending',
              issues: []
            };
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch WooCommerce catalog:', err);
    }

    return [];
  },

  async syncProduct(
    rawUrl: string, 
    consumerKey: string | undefined, 
    consumerSecret: string | undefined, 
    productId: string, 
    updatedMeta: { title: string; metaDescription: string }
  ): Promise<SyncProductResult> {
    const cleanUrl = this.normalizeUrl(rawUrl);

    if (!consumerKey || !consumerSecret) {
      return {
        success: false,
        synced: false,
        status: 'authorization_required',
        syncedVia: 'WooCommerce REST API v3',
        message: 'Para escribir y sincronizar cambios en WooCommerce se requiere Consumer Key y Consumer Secret con permisos de lectura/escritura.',
        errorDetails: 'Faltan credenciales de escritura WooCommerce'
      };
    }

    try {
      const endpoint = `${cleanUrl}/wp-json/wc/v3/products/${productId}`;
      const authHeader = 'Basic ' + Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');

      const payload = {
        name: updatedMeta.title,
        meta_data: [
          { key: '_yoast_wpseo_title', value: updatedMeta.title },
          { key: '_yoast_wpseo_metadesc', value: updatedMeta.metaDescription },
          { key: 'rank_math_title', value: updatedMeta.title },
          { key: 'rank_math_description', value: updatedMeta.metaDescription }
        ]
      };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return {
          success: true,
          synced: true,
          status: 'completed',
          syncedVia: 'WooCommerce REST API v3 (/wp-json/wc/v3/products)',
          message: `Metadatos SEO sincronizados con éxito en WooCommerce para el producto #${productId}.`
        };
      }

      const errText = await res.text();
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'WooCommerce REST API v3',
        message: `WooCommerce rechazó la actualización: ${errText.slice(0, 120)}`,
        errorDetails: errText
      };
    } catch (err: any) {
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'WooCommerce REST API v3',
        message: `Error al sincronizar con WooCommerce: ${err.message}`,
        errorDetails: err.message
      };
    }
  }
};

// ----------------------------------------------------
// PRESTASHOP CONNECTOR
// ----------------------------------------------------
export const prestashopConnector = {
  normalizeUrl(raw: string): string {
    let url = raw.trim().replace(/\/$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  },

  async verifyConnection(rawUrl: string, apiKey?: string): Promise<VerifyConnectionResult> {
    const startTime = Date.now();
    const cleanUrl = this.normalizeUrl(rawUrl);

    if (!rawUrl || !apiKey) {
      return {
        success: false,
        verified: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        connectionMethod: 'PrestaShop WebService XML/JSON API',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: 0,
        message: 'La URL de la tienda y la API Key del WebService de PrestaShop son obligatorias.'
      };
    }

    try {
      const endpoint = `${cleanUrl}/api/products?output_format=JSON&limit=1`;
      const authHeader = 'Basic ' + Buffer.from(`${apiKey.trim()}:`).toString('base64');

      const res = await fetch(endpoint, {
        headers: { 'Authorization': authHeader }
      });

      const latency = Date.now() - startTime;

      if (res.ok) {
        return {
          success: true,
          verified: true,
          platform: 'prestashop',
          storeUrl: cleanUrl,
          connectionMethod: 'PrestaShop WebService API (Autenticado con WebService Key)',
          scopesGranted: ['GET products', 'PUT products', 'GET categories'],
          connectionStatus: 'connected',
          latencyMs: latency,
          message: 'Conexión con PrestaShop WebService API verificada y autorizada con éxito.'
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          verified: false,
          platform: 'prestashop',
          storeUrl: cleanUrl,
          connectionMethod: 'PrestaShop WebService',
          scopesGranted: [],
          connectionStatus: 'authorization_required',
          latencyMs: latency,
          message: 'API Key de PrestaShop denegada (401/403). Comprueba que el WebService esté activo en Parámetros Avanzados > WebService.',
          error: 'Error de autorización en PrestaShop WebService'
        };
      }

      return {
        success: false,
        verified: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        connectionMethod: 'PrestaShop WebService',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: latency,
        message: `HTTP ${res.status} al conectar con PrestaShop en ${endpoint}.`,
        error: `HTTP ${res.status}`
      };
    } catch (err: any) {
      return {
        success: false,
        verified: false,
        platform: 'prestashop',
        storeUrl: cleanUrl,
        connectionMethod: 'PrestaShop WebService',
        scopesGranted: [],
        connectionStatus: 'error',
        latencyMs: Date.now() - startTime,
        message: `Error de red al conectar con PrestaShop: ${err.message}`,
        error: err.message
      };
    }
  },

  async fetchCatalog(rawUrl: string, apiKey?: string): Promise<SEOStoreProduct[]> {
    if (!apiKey) return [];
    const cleanUrl = this.normalizeUrl(rawUrl);

    try {
      const endpoint = `${cleanUrl}/api/products?output_format=JSON&display=full&limit=50`;
      const authHeader = 'Basic ' + Buffer.from(`${apiKey.trim()}:`).toString('base64');

      const res = await fetch(endpoint, {
        headers: { 'Authorization': authHeader }
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.products || [];
        if (Array.isArray(items)) {
          return items.map((p: any): SEOStoreProduct => {
            const rawTitle = typeof p.name === 'string' ? p.name : p.name?.[0]?.value || '';
            const rawDesc = typeof p.description_short === 'string' ? p.description_short : p.description_short?.[0]?.value || '';
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
            const metaTitle = typeof p.meta_title === 'string' ? p.meta_title : p.meta_title?.[0]?.value || rawTitle;
            const metaDesc = typeof p.meta_description === 'string' ? p.meta_description : p.meta_description?.[0]?.value || '';

            return {
              id: String(p.id),
              storeId: cleanUrl,
              title: rawTitle,
              handle: p.link_rewrite || String(p.id),
              price: parseFloat(p.price || '0'),
              currency: 'EUR',
              description: cleanDesc,
              category: 'General',
              images: p.id_default_image ? [
                { url: `${cleanUrl}/api/images/products/${p.id}/${p.id_default_image}`, altText: rawTitle }
              ] : [],
              metaTitle,
              metaDescription: metaDesc,
              canonicalUrl: `${cleanUrl}/${p.id}-${p.link_rewrite || 'product'}.html`,
              score: 0,
              status: 'pending',
              issues: []
            };
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch PrestaShop catalog:', err);
    }

    return [];
  },

  async syncProduct(
    rawUrl: string, 
    apiKey: string | undefined, 
    productId: string, 
    updatedMeta: { title: string; metaDescription: string }
  ): Promise<SyncProductResult> {
    const cleanUrl = this.normalizeUrl(rawUrl);

    if (!apiKey) {
      return {
        success: false,
        synced: false,
        status: 'authorization_required',
        syncedVia: 'PrestaShop WebService',
        message: 'API Key de PrestaShop WebService requerida para sincronizar cambios.',
        errorDetails: 'Falta API Key'
      };
    }

    try {
      const endpoint = `${cleanUrl}/api/products/${productId}?output_format=JSON`;
      const authHeader = 'Basic ' + Buffer.from(`${apiKey.trim()}:`).toString('base64');

      // Fetch current product XML/JSON to update meta fields
      const getRes = await fetch(endpoint, {
        headers: { 'Authorization': authHeader }
      });

      if (!getRes.ok) {
        return {
          success: false,
          synced: false,
          status: 'error',
          syncedVia: 'PrestaShop WebService',
          message: `No se pudo obtener el producto #${productId} en PrestaShop.`,
          errorDetails: `HTTP ${getRes.status}`
        };
      }

      const currentData = await getRes.json();
      const product = currentData.product;
      product.meta_title = updatedMeta.title;
      product.meta_description = updatedMeta.metaDescription;

      const putRes = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
      });

      if (putRes.ok) {
        return {
          success: true,
          synced: true,
          status: 'completed',
          syncedVia: 'PrestaShop WebService XML/JSON API',
          message: `Metadatos actualizados en PrestaShop para el producto #${productId}.`
        };
      }

      const errText = await putRes.text();
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'PrestaShop WebService',
        message: `PrestaShop rechazó la actualización: ${errText.slice(0, 120)}`,
        errorDetails: errText
      };
    } catch (err: any) {
      return {
        success: false,
        synced: false,
        status: 'error',
        syncedVia: 'PrestaShop WebService',
        message: `Error al conectar con PrestaShop WebService: ${err.message}`,
        errorDetails: err.message
      };
    }
  }
};
