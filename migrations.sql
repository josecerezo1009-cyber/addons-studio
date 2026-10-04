-- ============================================================================
-- CORE ECOMMERCE CONNECTOR SYSTEM - PRODUCTION DATABASE MIGRATION SCRIPT
-- PostgreSQL Schema for Shopify, WooCommerce, PrestaShop & Modular App Ecosystem
-- ============================================================================

-- 1. STORES TABLE
-- Primary registry for merchant ecommerce stores, platforms, domains and encrypted tokens
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(255) PRIMARY KEY,
    store_id VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    encrypted_token TEXT NOT NULL,
    encrypted_access_token TEXT,
    name VARCHAR(255),
    url TEXT,
    status VARCHAR(50) DEFAULT 'connected' NOT NULL,
    platform_version VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'EUR',
    timezone VARCHAR(100) DEFAULT 'UTC',
    owner_email VARCHAR(255),
    latency_ms INTEGER DEFAULT 0,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. APP CONFIGURATIONS TABLE
-- Store-specific settings, feature toggles, and metadata for installed modular applications
CREATE TABLE IF NOT EXISTS app_configurations (
    config_id VARCHAR(255) PRIMARY KEY,
    store_id VARCHAR(255) NOT NULL,
    settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    client_id VARCHAR(255),
    default_scopes TEXT,
    redirect_uri TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SYNCHRONIZATION LOGS TABLE
-- Audit log trail and telemetry for OAuth handshakes, webhooks, and catalog synchronization events
CREATE TABLE IF NOT EXISTS synchronization_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    store_id VARCHAR(255) NOT NULL,
    event VARCHAR(100) NOT NULL,
    event_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    error_message TEXT,
    error TEXT,
    items_processed INTEGER DEFAULT 0,
    items_succeeded INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    payload_summary JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ENCRYPTED TOKENS VAULT TABLE
-- Dedicated encrypted vault for OAuth Bearer tokens, API credentials, and Webhook secrets
CREATE TABLE IF NOT EXISTS encrypted_tokens (
    id VARCHAR(255) PRIMARY KEY,
    store_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer' NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    encrypted_api_secret TEXT,
    encrypted_webhook_secret TEXT,
    api_key TEXT,
    encryption_algorithm VARCHAR(50) DEFAULT 'aes-256-gcm' NOT NULL,
    scopes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & QUERY OPTIMIZATION INDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stores_domain ON stores(domain);
CREATE INDEX IF NOT EXISTS idx_stores_platform ON stores(platform);
CREATE INDEX IF NOT EXISTS idx_app_config_store_id ON app_configurations(store_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_store_id ON synchronization_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_event ON synchronization_logs(event);
CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp ON synchronization_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_encrypted_tokens_store_id ON encrypted_tokens(store_id);
