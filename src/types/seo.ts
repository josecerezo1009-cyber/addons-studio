import { EcommercePlatform } from './index';

export type SEOProductStatus = 
  | 'pending' 
  | 'analyzing' 
  | 'processing'
  | 'optimized' 
  | 'synced' 
  | 'completed'
  | 'error' 
  | 'authorization_required';

export interface SEOConnectedStore {
  id: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'prestashop';
  url: string;
  status: 'connected' | 'authorization_required' | 'error' | 'pending';
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  shopifyShop?: string;
  connectedAt: string;
  lastSync?: string;
  latencyMs?: number;
  scopesGranted?: string[];
  connectionMethod?: string;
  stats?: {
    totalProducts?: number;
    categoriesCount?: number;
    analyzedCount?: number;
  };
}

export interface SEOIssue {
  type: 
    | 'missing_meta_desc' 
    | 'short_title' 
    | 'title_too_short'
    | 'title_too_long'
    | 'meta_desc_too_short'
    | 'meta_desc_too_long'
    | 'missing_alt_tags'
    | 'description_thin_content'
    | 'no_alt' 
    | 'low_keyword_density' 
    | 'missing_schema' 
    | 'long_title';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface SEOAIOptimization {
  suggestedTitle: string;
  titleLength: number;
  suggestedMetaDescription: string;
  metaDescriptionLength: number;
  suggestedDescriptionSnippet: string;
  suggestedImageAlts: string[];
  targetKeywords: string[];
  schemaJsonLd: string;
  estimatedCtrLift: string;
  explanation: string;
}

export interface SEOStoreProduct {
  id: string;
  storeId: string;
  title: string;
  handle: string;
  price: number;
  currency: string;
  description: string;
  category: string;
  images: { url: string; altText?: string }[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  score: number; // 0 to 100
  status: SEOProductStatus;
  issues: SEOIssue[];
  aiOptimization?: SEOAIOptimization;
  lastSyncedAt?: string;
  lastError?: string;
}

export interface SEOCatalogScanResult {
  storeId: string;
  storeName: string;
  storePlatform: EcommercePlatform;
  scanDate: string;
  totalProducts: number;
  overallScore: number;
  criticalIssuesCount: number;
  warningsCount: number;
  optimizedCount: number;
  products: SEOStoreProduct[];
  executiveSummary: string;
  priorityActions: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedProductsCount: number;
  }[];
}

export interface SEOChangeHistoryItem {
  id: string;
  storeId: string;
  storeName: string;
  productId: string;
  productTitle: string;
  appliedAt: string;
  timestamp?: string;
  changesSummary?: string;
  previousMeta: {
    title: string;
    metaDescription: string;
  };
  updatedMeta: {
    title: string;
    metaDescription: string;
  };
  syncedVia: string;
  status: 'synced' | 'completed' | 'reverted' | 'error';
}

export type SEOProductAnalysis = SEOStoreProduct;
export type SEOAuditResult = SEOCatalogScanResult;

