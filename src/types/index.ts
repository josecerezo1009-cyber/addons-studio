export type UserRole = 'merchant' | 'creator' | 'agency' | 'admin';

export type EcommercePlatform = 'shopify' | 'woocommerce' | 'prestashop' | 'magento' | 'bigcommerce' | 'custom_api';

export type AppCategory = 
  | 'conversion' 
  | 'marketing' 
  | 'support' 
  | 'checkout' 
  | 'analytics' 
  | 'inventory' 
  | 'loyalty' 
  | 'shipping'
  | 'operations'
  | 'seo';

export type AppPublicationStatus = 
  | 'draft' 
  | 'ai_validation' 
  | 'security_review' 
  | 'approved' 
  | 'published' 
  | 'rejected'
  | 'suspended';

export type AppPricingType = 'free' | 'monthly' | 'one_time';

export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export interface AppFeature {
  title: string;
  description: string;
  impact?: string;
}

export interface SecurityAuditResult {
  passed: boolean;
  score: number;
  vulnerabilityCount: number;
  gdprCompliance: string;
  performanceRating: string;
  checks: {
    name: string;
    status: 'passed' | 'warning' | 'failed';
    details: string;
  }[];
  recommendations: string[];
}

export interface ProjectDocumentation {
  commercialDescription: string;
  featureMatrix: string;
  installationGuide: {
    shopify: string;
    woocommerce: string;
    prestashop: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  updateNotes: string;
}

export interface ProjectVersion {
  version: string;
  timestamp: string;
  changelog: string;
  snapshot: Partial<StudioProject>;
}

export interface AISuggestion {
  id: string;
  agent: 'product' | 'architect' | 'ux' | 'business' | 'reviewer';
  type: 'functional' | 'visual' | 'commercial' | 'pricing' | 'security';
  title: string;
  description: string;
  impact: string;
  applied: boolean;
  actionPayload: any;
}

export interface StudioProject {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  objective?: string;
  problemSolved?: string;
  targetAudience?: string;
  category: AppCategory;
  platforms: EcommercePlatform[];
  pricingType: AppPricingType;
  priceMonthly: number;
  priceOneTime: number;
  rating: number;
  reviewsCount: number;
  installsCount: number;
  creatorId: string;
  creatorName: string;
  status: AppPublicationStatus;
  version: string;
  features: AppFeature[];
  codeFiles?: CodeFile[];
  permissionsRequired: string[];
  webhooks: string[];
  tags?: string[];
  defaultSettings?: Record<string, any>;
  documentation?: ProjectDocumentation;
  versions?: ProjectVersion[];
  suggestions?: AISuggestion[];
  securityAudit?: SecurityAuditResult;
  lastAutoSaved?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EcommerceApp extends StudioProject {
  banner?: string;
  icon: string;
  creatorAvatar?: string;
  verified: boolean;
  galleryImages?: string[];
  videoDemoUrl?: string;
  difficulty?: 'no_code' | 'guided' | 'developer';
  minPlatformVersion?: string;
  requirements?: string[];
  supportedLanguages?: string[];
  freeTrialDays?: number;
  highlightBadge?: 'trending' | 'top_seller' | 'staff_pick' | 'new';
}

export interface AppInstallation {
  id: string;
  appId: string;
  appName: string;
  version?: string;
  storeId: string;
  storeName: string;
  storePlatform: EcommercePlatform;
  storeUrl: string;
  installedAt: string;
  status: 'active' | 'paused' | 'uninstalled';
  activePlan: 'free' | 'monthly' | 'one_time';
  monthlyCost: number;
  licenseKey: string;
  config: Record<string, any>;
  stats: {
    recoveredRevenue?: number;
    eventsHandled?: number;
    conversionRate?: number;
    lastActive?: string;
  };
}

export interface ConnectedStore {
  id: string;
  name: string;
  platform: EcommercePlatform;
  url: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  webhookSecret?: string;
  connectedAt: string;
  lastSync: string;
  stats: {
    revenue: number;
    orders: number;
    products: number;
    currency: string;
  };
}

export interface Transaction {
  id: string;
  type: 'sale' | 'payout' | 'commission' | 'subscription';
  amount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  creatorId: string;
  appId?: string;
  appName?: string;
  storeName?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
  payoutMethod?: string;
  invoiceUrl?: string;
}

export interface AgencyClient {
  id: string;
  name: string;
  company: string;
  email: string;
  storesCount: number;
  activeAppsCount: number;
  assignedStores: {
    storeName: string;
    platform: EcommercePlatform;
    url: string;
    installedApps: string[];
  }[];
  monthlyRetainer: number;
  status: 'active' | 'onboarding' | 'paused';
  createdAt: string;
}

export interface CuratedCollection {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  iconName: string;
  bannerGradient: string;
  appIds: string[];
  targetPlatform?: EcommercePlatform;
  featured?: boolean;
}

export interface CreatorPublicProfile {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  bio: string;
  verified: boolean;
  rating: number;
  totalInstalls: number;
  activeAppsCount: number;
  memberSince: string;
  specializations: string[];
  websiteUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  badge: string;
}

export interface AppLicense {
  id: string;
  licenseKey: string;
  appId: string;
  appName: string;
  merchantId: string;
  storeUrl: string;
  storePlatform: EcommercePlatform;
  plan: 'free' | 'monthly' | 'one_time';
  status: 'active' | 'trial' | 'expired' | 'revoked';
  issuedAt: string;
  expiresAt?: string;
  renewalDate?: string;
  lastValidatedAt: string;
  signatureHash: string;
  monthlyCost: number;
}

export interface Review {
  id: string;
  appId: string;
  authorName: string;
  authorAvatar?: string;
  storePlatform: EcommercePlatform;
  rating: number;
  date: string;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  merchantStore?: string;
  easeOfUseRating?: number;
  supportRating?: number;
  developerResponse?: {
    authorName: string;
    text: string;
    date: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security' | 'financial';
  read: boolean;
  linkView?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'technical' | 'billing' | 'installation' | 'developer_api' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: {
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  companyName?: string;
  balance: number;
  plan: 'free' | 'pro' | 'enterprise';
  stripeConnected: boolean;
  stripeAccountId?: string;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
}
