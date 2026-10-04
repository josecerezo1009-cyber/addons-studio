import { pgTable, serial, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table linked with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('merchant').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Stores Table (stores: store_id, platform, domain, encrypted_access_token, created_at, updated_at)
export const stores = pgTable('stores', {
  storeId: text('store_id').primaryKey(), // store_shopify_myshop or unique ID
  platform: text('platform').notNull(), // 'shopify' | 'woocommerce' | 'prestashop'
  domain: text('domain').notNull(), // e.g. 'my-store.myshopify.com' or 'https://my-store.com'
  encryptedAccessToken: text('encrypted_access_token').notNull(), // AES-256-GCM encrypted token
  name: text('name'),
  url: text('url'),
  status: text('status').default('connected').notNull(),
  platformVersion: text('platform_version'),
  currency: text('currency').default('EUR'),
  timezone: text('timezone').default('UTC'),
  ownerEmail: text('owner_email'),
  latencyMs: integer('latency_ms').default(0),
  lastSyncAt: timestamp('last_sync_at'),
  meta: jsonb('meta').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. App Configurations Table (app_configurations: config_id, store_id, settings_json)
export const appConfigurations = pgTable('app_configurations', {
  configId: text('config_id').primaryKey(), // e.g. config_storeId
  storeId: text('store_id').references(() => stores.storeId, { onDelete: 'cascade' }),
  settingsJson: jsonb('settings_json').default({}).notNull(),
  clientId: text('client_id'),
  defaultScopes: text('default_scopes').default('read_products,write_products,read_inventory,read_product_listings'),
  redirectUri: text('redirect_uri'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Synchronization Logs Table (synchronization_logs: log_id, store_id, event_type, status, error_message, timestamp)
export const synchronizationLogs = pgTable('synchronization_logs', {
  logId: text('log_id').primaryKey(), // e.g. sync_1728000000000_abc
  storeId: text('store_id').notNull().references(() => stores.storeId, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // 'oauth_handshake' | 'inventory_extract' | 'catalog_scan' | 'product_sync' | 'health_check'
  status: text('status').notNull().default('completed'), // 'pending' | 'completed' | 'failed'
  errorMessage: text('error_message'),
  itemsProcessed: integer('items_processed').default(0),
  itemsSucceeded: integer('items_succeeded').default(0),
  itemsFailed: integer('items_failed').default(0),
  payloadSummary: jsonb('payload_summary').default({}),
  executionTimeMs: integer('execution_time_ms').default(0),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 5. Encrypted Tokens Table (Separate Token Vault)
export const encryptedTokens = pgTable('encrypted_tokens', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.storeId, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  tokenType: text('token_type').default('Bearer').notNull(),
  encryptedAccessToken: text('encrypted_access_token').notNull(),
  encryptedRefreshToken: text('encrypted_refresh_token'),
  encryptedApiSecret: text('encrypted_api_secret'),
  encryptedWebhookSecret: text('encrypted_webhook_secret'),
  apiKey: text('api_key'),
  encryptionAlgorithm: text('encryption_algorithm').default('aes-256-gcm').notNull(),
  scopes: text('scopes'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Compatibility Table: store_connections
export const storeConnections = pgTable('store_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  platform: text('platform').notNull(),
  storeName: text('store_name').notNull(),
  storeUrl: text('store_url').notNull(),
  shopDomain: text('shop_domain'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  webhookSecret: text('webhook_secret'),
  scopes: text('scopes'),
  tokenType: text('token_type').default('Bearer'),
  status: text('status').default('connected').notNull(),
  connectionMethod: text('connection_method').default('oauth2'),
  expiresAt: timestamp('expires_at'),
  installedAt: timestamp('installed_at').defaultNow(),
  lastSyncAt: timestamp('last_sync_at'),
  latencyMs: integer('latency_ms').default(0),
  meta: jsonb('meta').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Compatibility Table: store_metadata
export const storeMetadata = pgTable('store_metadata', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => storeConnections.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  platformVersion: text('platform_version'),
  storeEmail: text('store_email'),
  currency: text('currency').default('EUR'),
  currencySymbol: text('currency_symbol').default('€'),
  timezone: text('timezone').default('UTC'),
  ianaTimezone: text('iana_timezone').default('UTC'),
  countryCode: text('country_code').default('ES'),
  defaultLocale: text('default_locale').default('es_ES'),
  planName: text('plan_name').default('standard'),
  featuresEnabled: jsonb('features_enabled').default({}),
  healthStatus: text('health_status').default('healthy').notNull(),
  lastHealthCheckAt: timestamp('last_health_check_at').defaultNow(),
  healthCheckLatencyMs: integer('health_check_latency_ms').default(0),
  healthDetails: jsonb('health_details').default({}),
  totalProductsCount: integer('total_products_count').default(0),
  totalOrdersCount: integer('total_orders_count').default(0),
  totalCategoriesCount: integer('total_categories_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Compatibility Table: ecommerce_sync_logs
export const ecommerceSyncLogs = pgTable('ecommerce_sync_logs', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => storeConnections.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  syncType: text('sync_type').notNull(),
  status: text('status').default('completed').notNull(),
  itemsProcessed: integer('items_processed').default(0),
  itemsSucceeded: integer('items_succeeded').default(0),
  itemsFailed: integer('items_failed').default(0),
  payloadSummary: jsonb('payload_summary').default({}),
  errorDetails: jsonb('error_details').default({}),
  executionTimeMs: integer('execution_time_ms').default(0),
  initiatedBy: text('initiated_by').default('system'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// 9. Store Products Table
export const storeProducts = pgTable('store_products', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  externalProductId: text('external_product_id').notNull(),
  title: text('title').notNull(),
  handle: text('handle'),
  vendor: text('vendor'),
  productType: text('product_type'),
  descriptionHtml: text('description_html'),
  descriptionText: text('description_text'),
  currentMetaTitle: text('current_meta_title'),
  currentMetaDescription: text('current_meta_description'),
  canonicalUrl: text('canonical_url'),
  inventoryQuantity: integer('inventory_quantity').default(0),
  images: jsonb('images').default([]),
  variants: jsonb('variants').default([]),
  tags: jsonb('tags').default([]),
  seoScore: integer('seo_score').default(0),
  seoStatus: text('seo_status').default('pending').notNull(),
  seoIssues: jsonb('seo_issues').default([]),
  proposedTitle: text('proposed_title'),
  proposedMetaDescription: text('proposed_meta_description'),
  proposedKeywords: jsonb('proposed_keywords').default([]),
  proposedSchemaJsonLd: text('proposed_schema_json_ld'),
  proposedAltTags: jsonb('proposed_alt_tags').default([]),
  lastScannedAt: timestamp('last_scanned_at'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 10. SEO Audit History
export const seoAuditHistory = pgTable('seo_audit_history', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  productId: text('product_id').notNull(),
  productTitle: text('product_title').notNull(),
  action: text('action').notNull(),
  changesSummary: text('changes_summary').notNull(),
  previousValues: jsonb('previous_values').default({}),
  newValues: jsonb('new_values').default({}),
  status: text('status').default('synced').notNull(),
  appliedBy: text('applied_by').default('AI SEO Pro Engine'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const storesRelations = relations(stores, ({ one, many }) => ({
  tokens: one(encryptedTokens, {
    fields: [stores.storeId],
    references: [encryptedTokens.storeId],
  }),
  appConfig: one(appConfigurations, {
    fields: [stores.storeId],
    references: [appConfigurations.storeId],
  }),
  syncLogs: many(synchronizationLogs),
}));

export const encryptedTokensRelations = relations(encryptedTokens, ({ one }) => ({
  store: one(stores, {
    fields: [encryptedTokens.storeId],
    references: [stores.storeId],
  }),
}));

export const appConfigurationsRelations = relations(appConfigurations, ({ one }) => ({
  store: one(stores, {
    fields: [appConfigurations.storeId],
    references: [stores.storeId],
  }),
}));

export const synchronizationLogsRelations = relations(synchronizationLogs, ({ one }) => ({
  store: one(stores, {
    fields: [synchronizationLogs.storeId],
    references: [stores.storeId],
  }),
}));
