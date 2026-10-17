-- AZAKA — transactional ticket generation + auditable draw/reveal hardening
-- Safe to run more than once.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS batch_sequence INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_public_id ON tickets(public_id);

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

-- Undisclosed legacy inventory loses its old predetermined outcome. Historical
-- SOLD/REVEALED/REDEEMED outcomes remain unchanged.
UPDATE tickets
SET prize_amount=NULL, prize_tier=NULL
WHERE status='CREATED';

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_transitions;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_transitions CHECK (
    (status = 'CREATED' AND owner_id IS NULL AND prize_amount IS NULL AND revealed_at IS NULL) OR
    (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NULL AND revealed_at IS NULL) OR
    (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL) OR
    (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL AND redeemed_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS azaka_ticket_generation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES ticket_batches(id) ON DELETE RESTRICT,
    request_key VARCHAR(128) NOT NULL,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    generated_quantity INTEGER NOT NULL DEFAULT 0 CHECK (generated_quantity >= 0),
    first_sequence INTEGER,
    last_sequence INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(batch_id, request_key)
);

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
