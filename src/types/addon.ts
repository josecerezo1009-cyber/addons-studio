import { EcommercePlatform, AppCategory } from './index';

export type AddonStatus = 'active' | 'inactive' | 'deprecated';

export interface AddonPricing {
  type: 'free' | 'monthly' | 'one_time';
  priceMonthly: number;
  priceOneTime?: number;
  trialDays?: number;
}

export interface AddonDefinition {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  icon: string;
  category: AppCategory;
  version: string;
  status: AddonStatus;
  author: string;
  isOfficial: boolean;
  supportedPlatforms: EcommercePlatform[];
  compatiblePlans: ('free' | 'pro' | 'enterprise')[];
  pricing: AddonPricing;
  permissions: string[];
  webhooks: string[];
  defaultConfig: Record<string, any>;
  routeKey: string;
  stats: {
    installationsCount: number;
    activeUsersCount: number;
    avgRating: number;
    reviewsCount: number;
  };
}

export interface StoreReviewItem {
  id: string;
  storeId: string;
  storeName: string;
  storePlatform: EcommercePlatform;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  createdAt: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number; // -1.0 to 1.0
  sentimentSummary?: string;
  detectedIssues?: string[];
  improvementOpportunities?: string[];
  smartReply?: {
    text: string;
    tone: 'professional' | 'empathetic' | 'energetic';
    sentAt: string;
    author: string;
    discountOffered?: string;
  };
  status: 'pending' | 'replied' | 'flagged';
  verifiedPurchase: boolean;
}

export interface ReviewAIInsight {
  totalAnalyzed: number;
  npsScore: number;
  csatPercentage: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  topRecurringIssues: {
    category: string;
    issue: string;
    frequency: number;
    severity: 'high' | 'medium' | 'low';
    trend: 'up' | 'down' | 'stable';
    recommendation: string;
  }[];
  improvementOpportunities: {
    area: string;
    action: string;
    estimatedImpact: string;
  }[];
  executiveSummary: string;
}
