-- AZAKA — transactional ticket generation + auditable draw/reveal hardening
-- Safe to run more than once.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- A generated ticket has a stable sequence inside its batch. This is the
-- authoritative identity used by the generator; public_id remains unique.
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS batch_sequence INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_public_id ON tickets(public_id);

-- Backfill legacy inventory deterministically before enforcing the per-batch
-- uniqueness rule. Existing duplicate sequence values are assigned by id order.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY batch_id ORDER BY created_at, id) AS seq
  FROM tickets
  WHERE batch_sequence IS NULL
)
UPDATE tickets t
SET batch_sequence = ranked.seq
FROM ranked
WHERE t.id = ranked.id;

ALTER TABLE tickets ALTER COLUMN batch_sequence SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_batch_sequence ON tickets(batch_id, batch_sequence);

-- The result MUST NOT exist before the server-side draw. This removes the old
-- "predetermined prize" invariant while keeping already revealed history valid.
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_transitions;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_transitions CHECK (
    (status = 'CREATED' AND owner_id IS NULL AND prize_amount IS NULL AND revealed_at IS NULL) OR
    (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NULL AND revealed_at IS NULL) OR
    (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL) OR
    (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL AND redeemed_at IS NOT NULL)
);

-- One immutable draw per ticket. The nonce is stored so the result can be
-- independently recomputed/audited; the derived roll is what drives the prize.
CREATE TABLE IF NOT EXISTS ticket_draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES ticket_batches(id) ON DELETE RESTRICT,
    algorithm_version VARCHAR(32) NOT NULL,
    nonce_hex VARCHAR(64) NOT NULL,
    nonce_hash VARCHAR(64) NOT NULL,
    roll INTEGER NOT NULL CHECK (roll BETWEEN 0 AND 999999),
    winning BOOLEAN NOT NULL,
    prize_amount BIGINT NOT NULL CHECK (prize_amount >= 0),
    prize_tier INTEGER NOT NULL CHECK (prize_tier BETWEEN 0 AND 3),
    drawn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(nonce_hash)
);

CREATE INDEX IF NOT EXISTS idx_ticket_draws_batch ON ticket_draws(batch_id, drawn_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_revealable ON tickets(owner_id, status) WHERE status = 'SOLD';
