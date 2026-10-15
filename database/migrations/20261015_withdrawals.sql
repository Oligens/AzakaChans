-- AZAKA CHANS - Production withdrawal workflow.
-- Safe to run repeatedly.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS reserved_amount NUMERIC(18,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'HTG',
  method VARCHAR(16) NOT NULL CHECK (method IN ('MONCASH','NATCASH','BANK')),
  beneficiary_name VARCHAR(120) NOT NULL,
  destination_phone VARCHAR(32),
  bank_name VARCHAR(120),
  bank_account_number VARCHAR(120),
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VALIDATED','REJECTED','PAID')),
  idempotency_key VARCHAR(160) NOT NULL UNIQUE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  admin_notes TEXT,
  payment_reference VARCHAR(160),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT withdrawal_destination_check CHECK (
    (method IN ('MONCASH','NATCASH') AND destination_phone IS NOT NULL AND bank_name IS NULL AND bank_account_number IS NULL)
    OR
    (method = 'BANK' AND bank_name IS NOT NULL AND bank_account_number IS NOT NULL AND destination_phone IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_status
  ON withdrawal_requests(user_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status
  ON withdrawal_requests(status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by
  ON withdrawal_requests(processed_by, updated_at DESC);

CREATE TABLE IF NOT EXISTS withdrawal_audit_log (
  id BIGSERIAL PRIMARY KEY,
  withdrawal_id UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(32) NOT NULL,
  from_status VARCHAR(16),
  to_status VARCHAR(16),
  amount NUMERIC(18,2),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_audit_withdrawal
  ON withdrawal_audit_log(withdrawal_id, created_at DESC);

-- Keep wallet reservation from ever becoming negative.
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_reserved_amount_nonnegative;
ALTER TABLE wallets ADD CONSTRAINT wallets_reserved_amount_nonnegative CHECK (reserved_amount >= 0);

-- Reconcile reservation with existing non-final withdrawal rows if this migration is
-- installed after an earlier implementation. Existing requests are not invented;
-- only requests already present in the new table are considered.
UPDATE wallets w
SET reserved_amount = COALESCE((
  SELECT SUM(r.amount)
  FROM withdrawal_requests r
  WHERE r.wallet_id = w.id AND r.status IN ('PENDING','VALIDATED')
), 0), updated_at = NOW();
