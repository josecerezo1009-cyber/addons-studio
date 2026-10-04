import { db } from '../db/index.ts';
import { storeConnections, storeProducts, seoAuditHistory } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { shopifyOAuthService, decryptToken } from './shopifyOAuthService.ts';
import { shopifyConnector, wooCommerceConnector, prestashopConnector } from './ecommerceConnectors.ts';
import { GoogleGenAI } from '@google/genai';
import { SEOIssue, SEOStoreProduct, SEOCatalogScanResult } from '../types/seo.ts';

const ai = new GoogleGenAI();

/**
 * Strips HTML tags to produce clean plain text from product descriptions
 */
export function stripHtml(html: string = ''): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates technical SEO rules for an extracted inventory item
 */
export function analyzeProductSEO(product: {
  title: string;
  descriptionText: string;
  metaTitle?: string;
  metaDescription?: string;
  images: Array<{ url: string; alt?: string }>;
}): { score: number; issues: SEOIssue[]; status: string } {
  let score = 100;
  const issues: SEOIssue[] = [];

  const titleToTest = product.metaTitle || product.title;
  const descToTest = product.metaDescription || product.descriptionText;

  // Title length analysis
  if (!titleToTest || titleToTest.trim().length === 0) {
    score -= 30;
    issues.push({
      type: 'title_too_short',
      severity: 'high',
      message: 'El producto carece de etiqueta de título SEO.',
      suggestion: 'Añade un título optimizado de 50-60 caracteres con la palabra clave principal.'
    });
  } else if (titleToTest.length < 30) {
    score -= 15;
    issues.push({
      type: 'title_too_short',
      severity: 'high',
      message: `Título demasiado corto (${titleToTest.length} caracteres). Ideal: 50-60.`,
      suggestion: 'Expande el título con marca, características clave o beneficios.'
    });
  } else if (titleToTest.length > 70) {
    score -= 10;
    issues.push({
      type: 'title_too_long',
      severity: 'low',
      message: `Título demasiado largo (${titleToTest.length} caracteres). Podría truncarse en Google.`,
      suggestion: 'Ajusta el título a un máximo de 60 caracteres para visualización completa.'
    });
  }

  // Meta description analysis
  if (!descToTest || descToTest.trim().length === 0) {
    score -= 35;
    issues.push({
      type: 'missing_meta_desc',
      severity: 'high',
      message: 'Meta descripción ausente o vacía en el catálogo.',
      suggestion: 'Genera una meta descripción de 140-160 caracteres persuasiva con llamada a la acción.'
    });
  } else if (descToTest.length < 90) {
    score -= 20;
    issues.push({
      type: 'meta_desc_too_short',
      severity: 'medium',
      message: `Meta descripción corta (${descToTest.length} caracteres). Ideal: 140-160.`,
      suggestion: 'Enriquece con detalles de valor, especificaciones y envío rápido.'
    });
  } else if (descToTest.length > 170) {
    score -= 10;
    issues.push({
      type: 'meta_desc_too_long',
      severity: 'low',
      message: `Meta descripción extensa (${descToTest.length} caracteres). Google la truncará con puntos suspensivos.`,
      suggestion: 'Condensa el mensaje a menos de 160 caracteres.'
    });
  }

  // Image ALT tags analysis
  const imagesWithoutAlt = product.images.filter(img => !img.alt || img.alt.trim() === '');
  if (product.images.length > 0 && imagesWithoutAlt.length > 0) {
    const penalty = Math.min(25, imagesWithoutAlt.length * 10);
    score -= penalty;
    issues.push({
      type: 'missing_alt_tags',
      severity: imagesWithoutAlt.length === product.images.length ? 'high' : 'medium',
      message: `${imagesWithoutAlt.length} de ${product.images.length} imágenes no tienen texto ALT descriptivo.`,
      suggestion: 'Asigna etiquetas ALT con palabras clave descriptivas para indexación en Google Imágenes.'
    });
  }

  // Content depth analysis
  const wordCount = (product.descriptionText || '').split(/\s+/).filter(Boolean).length;
  if (wordCount < 40) {
    score -= 15;
    issues.push({
      type: 'description_thin_content',
      severity: 'medium',
      message: `Descripción con contenido escaso (${wordCount} palabras).`,
      suggestion: 'Amplía la descripción a un mínimo de 150 palabras con beneficios, materiales y FAQs.'
    });
  }

  score = Math.max(10, Math.min(100, score));
  const status = score >= 85 ? 'optimized' : 'pending';

  return { score, issues, status };
}

/**
 * Service to extract product inventory, descriptions, and metadata from connected stores,
 * analyze SEO health, and persist everything into PostgreSQL.
 */
export class StoreInventoryService {
  /**
   * Connects to Shopify store inventory API using stored PostgreSQL credentials
   * and extracts full product descriptions, metafields, variants, and images.
   */
  public async extractShopifyInventory(store: typeof storeConnections.$inferSelect): Promise<any[]> {
    const accessToken = store.accessToken ? decryptToken(store.accessToken) : (store.apiKey || '');
    const cleanDomain = shopifyOAuthService.sanitizeShopDomain(store.shopDomain || store.storeUrl);

    // 1. Fetch products from Shopify Admin REST API
    const url = `https://${cleanDomain}/admin/api/2024-01/products.json?limit=250`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (accessToken) {
      headers['X-Shopify-Access-Token'] = accessToken;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      // Fallback to public storefront JSON if private app token is not configured
      const publicUrl = `https://${cleanDomain}/products.json?limit=250`;
      const pubResp = await fetch(publicUrl);
      if (!pubResp.ok) {
        throw new Error(`Shopify API Inventory extraction failed [${response.status}] for ${cleanDomain}`);
      }
      const pubData = await pubResp.json();
      return pubData.products || [];
    }

    const data = await response.json();
    return data.products || [];
  }

  /**
   * Extracts inventory from WooCommerce REST API
   */
  public async extractWooCommerceInventory(store: typeof storeConnections.$inferSelect): Promise<any[]> {
    const rawUrl = store.storeUrl.replace(/\/+$/, '');
    const apiKey = store.apiKey || '';
    const apiSecret = store.apiSecret ? decryptToken(store.apiSecret) : '';

    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const endpoint = `${rawUrl}/wp-json/wc/v3/products?per_page=100`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce inventory extraction failed [${response.status}]`);
    }

    return await response.json();
  }

  /**
   * Extracts inventory from PrestaShop Webservice API
   */
  public async extractPrestaShopInventory(store: typeof storeConnections.$inferSelect): Promise<any[]> {
    const rawUrl = store.storeUrl.replace(/\/+$/, '');
    const apiKey = store.apiKey || '';
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');
    const endpoint = `${rawUrl}/api/products?output_format=JSON&display=full`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: authHeader,
        Output_Format: 'JSON',
      },
    });

    if (!response.ok) {
      throw new Error(`PrestaShop inventory extraction failed [${response.status}]`);
    }

    const data = await response.json();
    return data.products || [];
  }

  /**
   * Main pipeline: Extracts inventory from any connected store platform,
   * parses descriptions and metadata, runs technical SEO audit, and stores in PostgreSQL.
   */
  public async extractAndScanStoreCatalog(storeId: string): Promise<{
    store: typeof storeConnections.$inferSelect;
    extractedCount: number;
    averageScore: number;
    products: Array<typeof storeProducts.$inferSelect>;
  }> {
    const stores = await db.select().from(storeConnections).where(eq(storeConnections.id, storeId));
    if (!stores.length) {
      throw new Error(`Tienda con ID '${storeId}' no encontrada en la base de datos PostgreSQL.`);
    }

    const store = stores[0];
    let rawProducts: any[] = [];

    if (store.platform === 'shopify') {
      rawProducts = await this.extractShopifyInventory(store);
    } else if (store.platform === 'woocommerce') {
      rawProducts = await this.extractWooCommerceInventory(store);
    } else if (store.platform === 'prestashop') {
      rawProducts = await this.extractPrestaShopInventory(store);
    }

    const processedProducts: Array<typeof storeProducts.$inferSelect> = [];
    let totalScore = 0;

    for (const item of rawProducts) {
      const extId = String(item.id || item.handle || Date.now());
      const productId = `${store.id}_${extId}`;
      const title = item.title || item.name || 'Sin título';
      const handle = item.handle || item.slug || '';
      const vendor = item.vendor || '';
      const productType = item.product_type || item.type || '';
      const descriptionHtml = item.body_html || item.description || '';
      const descriptionText = stripHtml(descriptionHtml);

      // Extract images & ALT text
      let images: Array<{ url: string; alt?: string }> = [];
      if (Array.isArray(item.images)) {
        images = item.images.map((img: any) => ({
          url: typeof img === 'string' ? img : (img.src || img.url || ''),
          alt: typeof img === 'string' ? '' : (img.alt || img.alt_text || ''),
        })).filter((img: { url: string; alt?: string }) => Boolean(img.url));
      } else if (item.image?.src) {
        images = [{ url: item.image.src, alt: item.image.alt || '' }];
      }

      // Extract inventory count
      let inventoryQuantity = 0;
      if (Array.isArray(item.variants)) {
        inventoryQuantity = item.variants.reduce((acc: number, v: any) => acc + (Number(v.inventory_quantity) || 0), 0);
      } else if (item.stock_quantity !== undefined) {
        inventoryQuantity = Number(item.stock_quantity) || 0;
      }

      // Meta fields
      const metaTitle = item.meta_title || item.seo_title || title;
      const metaDescription = item.meta_description || item.seo_description || descriptionText.slice(0, 160);
      const canonicalUrl = `${store.storeUrl.replace(/\/+$/, '')}/products/${handle}`;

      // Run technical SEO evaluation
      const { score, issues, status } = analyzeProductSEO({
        title,
        descriptionText,
        metaTitle,
        metaDescription,
        images,
      });

      totalScore += score;

      // Upsert into PostgreSQL store_products table
      const [persistedProduct] = await db
        .insert(storeProducts)
        .values({
          id: productId,
          storeId: store.id,
          externalProductId: extId,
          title,
          handle,
          vendor,
          productType,
          descriptionHtml,
          descriptionText,
          currentMetaTitle: metaTitle,
          currentMetaDescription: metaDescription,
          canonicalUrl,
          inventoryQuantity,
          images,
          variants: item.variants || [],
          tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',').map((t: string) => t.trim()) : item.tags) : [],
          seoScore: score,
          seoStatus: status,
          seoIssues: issues,
          lastScannedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: storeProducts.id,
          set: {
            title,
            handle,
            vendor,
            productType,
            descriptionHtml,
            descriptionText,
            currentMetaTitle: metaTitle,
            currentMetaDescription: metaDescription,
            canonicalUrl,
            inventoryQuantity,
            images,
            variants: item.variants || [],
            seoScore: score,
            seoStatus: status,
            seoIssues: issues,
            lastScannedAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning();

      processedProducts.push(persistedProduct);
    }

    const averageScore = rawProducts.length > 0 ? Math.round(totalScore / rawProducts.length) : 0;

    // Update store connection lastSync and stats
    await db
      .update(storeConnections)
      .set({
        lastSyncAt: new Date(),
        meta: {
          ...((store.meta as any) || {}),
          totalProducts: rawProducts.length,
          averageSeoScore: averageScore,
        },
        updatedAt: new Date(),
      })
      .where(eq(storeConnections.id, storeId));

    return {
      store,
      extractedCount: rawProducts.length,
      averageScore,
      products: processedProducts,
    };
  }

  /**
   * Generates AI SEO Optimization proposal using Gemini API and persists proposal to PostgreSQL
   */
  public async generateAIOptimization(productId: string): Promise<typeof storeProducts.$inferSelect> {
    const products = await db.select().from(storeProducts).where(eq(storeProducts.id, productId));
    if (!products.length) {
      throw new Error(`Producto con ID '${productId}' no encontrado.`);
    }

    const prod = products[0];

    const prompt = `Eres el motor experto en SEO para Ecommerce de AI SEO Pro.
Analiza la siguiente información de producto extraída del inventario de la tienda:

Título Original: ${prod.title}
Descripción del Catálogo: ${prod.descriptionText}
Categoría / Tipo: ${prod.productType || 'General'}
Marca / Vendor: ${prod.vendor || 'Tienda'}
URL Canónica: ${prod.canonicalUrl || ''}
Imágenes encontradas: ${(prod.images as any[])?.length || 0} imágenes

Genera una optimización SEO completa en formato JSON estricto con las siguientes claves:
- "proposedTitle": Título SEO persuasivo de 50 a 60 caracteres (alto CTR, incluye keyword principal y marca).
- "proposedMetaDescription": Meta descripción atractiva de 140 a 160 caracteres con llamada a la acción y beneficios.
- "keywords": Lista de 4 a 6 palabras clave objetivo (primarias y secundarias).
- "altTags": Lista de textos ALT optimizados para cada imagen del producto.
- "schemaJsonLd": Bloque JSON-LD de tipo "Product" para Schema.org con name, description, offers, brand.
- "explanation": Breve resumen de las mejoras introducidas.

Responde ÚNICAMENTE con el objeto JSON válido sin bloques markdown ni texto extra.`;

    let aiResult: any = {};
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawJson = response.text?.trim() || '{}';
      aiResult = JSON.parse(rawJson);
    } catch (err: any) {
      console.warn('Gemini optimization fallback to rule-based generation:', err.message);
    const plainDesc = prod.descriptionText || prod.title || '';
    aiResult = {
      proposedTitle: `${prod.title} | Calidad Garantizada`,
      proposedMetaDescription: `Compra ${prod.title} al mejor precio. ${plainDesc.slice(0, 110)}... ¡Envío rápido y garantía asegurada!`,
      keywords: [prod.title.toLowerCase(), 'comprar ' + prod.title.toLowerCase(), 'oferta', 'calidad'],
      altTags: (prod.images as any[])?.map((_, i) => `${prod.title} - Vista ${i + 1} de alta definición`),
      schemaJsonLd: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: prod.title,
        description: plainDesc.slice(0, 150),
        brand: { '@type': 'Brand', name: prod.vendor || 'Tienda' },
      }),
    };
    }

    const [updatedProduct] = await db
      .update(storeProducts)
      .set({
        proposedTitle: aiResult.proposedTitle || prod.title,
        proposedMetaDescription: aiResult.proposedMetaDescription || prod.currentMetaDescription,
        proposedKeywords: aiResult.keywords || [],
        proposedSchemaJsonLd: typeof aiResult.schemaJsonLd === 'string' ? aiResult.schemaJsonLd : JSON.stringify(aiResult.schemaJsonLd || {}),
        proposedAltTags: aiResult.altTags || [],
        seoStatus: 'optimized',
        updatedAt: new Date(),
      })
      .where(eq(storeProducts.id, productId))
      .returning();

    return updatedProduct;
  }

  /**
   * Synchronizes approved SEO metadata to store inventory API (Shopify, WooCommerce, PrestaShop)
   * and records change event in PostgreSQL audit history.
   */
  public async syncProductToStore(params: {
    productId: string;
    newTitle?: string;
    newMetaDescription?: string;
    newDescriptionHtml?: string;
    approvedBy?: string;
  }): Promise<{ success: boolean; historyItem: typeof seoAuditHistory.$inferSelect }> {
    const products = await db.select().from(storeProducts).where(eq(storeProducts.id, params.productId));
    if (!products.length) {
      throw new Error(`Producto con ID '${params.productId}' no encontrado.`);
    }

    const prod = products[0];
    const stores = await db.select().from(storeConnections).where(eq(storeConnections.id, prod.storeId));
    if (!stores.length) {
      throw new Error(`Tienda asociada al producto no encontrada.`);
    }

    const store = stores[0];
    const finalTitle = params.newTitle || prod.proposedTitle || prod.title;
    const finalMetaDesc = params.newMetaDescription || prod.proposedMetaDescription || prod.currentMetaDescription;

    const previousValues = {
      title: prod.title,
      metaDescription: prod.currentMetaDescription,
    };

    const newValues = {
      title: finalTitle,
      metaDescription: finalMetaDesc,
    };

    // Push to Shopify / WooCommerce / PrestaShop API
    if (store.platform === 'shopify') {
      const accessToken = store.accessToken ? decryptToken(store.accessToken) : store.apiKey;
      const cleanDomain = shopifyOAuthService.sanitizeShopDomain(store.shopDomain || store.storeUrl);
      const url = `https://${cleanDomain}/admin/api/2024-01/products/${prod.externalProductId}.json`;

      if (accessToken) {
        await fetch(url, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: {
              id: prod.externalProductId,
              title: finalTitle,
              metafields_global_title_tag: finalTitle,
              metafields_global_description_tag: finalMetaDesc,
            },
          }),
        });
      }
    } else if (store.platform === 'woocommerce') {
      const rawUrl = store.storeUrl.replace(/\/+$/, '');
      const apiKey = store.apiKey || '';
      const apiSecret = store.apiSecret ? decryptToken(store.apiSecret) : '';
      const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      const endpoint = `${rawUrl}/wp-json/wc/v3/products/${prod.externalProductId}`;

      await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: finalTitle,
          meta_data: [
            { key: '_yoast_wpseo_title', value: finalTitle },
            { key: '_yoast_wpseo_metadesc', value: finalMetaDesc },
            { key: 'rank_math_title', value: finalTitle },
            { key: 'rank_math_description', value: finalMetaDesc },
          ],
        }),
      });
    }

    // Update product in PostgreSQL
    await db
      .update(storeProducts)
      .set({
        title: finalTitle,
        currentMetaTitle: finalTitle,
        currentMetaDescription: finalMetaDesc,
        seoStatus: 'synced',
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(storeProducts.id, params.productId));

    // Record in PostgreSQL seo_audit_history
    const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const [historyItem] = await db
      .insert(seoAuditHistory)
      .values({
        id: historyId,
        storeId: store.id,
        productId: prod.id,
        productTitle: finalTitle,
        action: 'sync_full',
        changesSummary: `Título y Meta Descripción actualizados en ${store.platform.toUpperCase()}`,
        previousValues,
        newValues,
        status: 'synced',
        appliedBy: params.approvedBy || 'AI SEO Pro User',
        timestamp: new Date(),
      })
      .returning();

    return { success: true, historyItem };
  }
}

export const storeInventoryService = new StoreInventoryService();
