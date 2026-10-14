-- Additive migration: stores verified ZakaPro webhook metadata for audit and deduplication.
-- It intentionally does not modify wallets or deposit balances.
CREATE TABLE IF NOT EXISTS zakapro_webhook_events (
    event_key VARCHAR(255) PRIMARY KEY,
    provider_event_id VARCHAR(255),
    event_type VARCHAR(255) NOT NULL,
    payment_reference VARCHAR(255),
    amount TEXT,
    currency VARCHAR(16),
    payment_method VARCHAR(64),
    payment_status VARCHAR(64),
    payload_sha256 CHAR(64) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zakapro_webhook_events_reference
    ON zakapro_webhook_events (payment_reference);

CREATE INDEX IF NOT EXISTS idx_zakapro_webhook_events_type_received
    ON zakapro_webhook_events (event_type, received_at DESC);
