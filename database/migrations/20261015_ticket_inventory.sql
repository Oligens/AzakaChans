-- AZAKA CHANS - Initial virtual ticket inventory.
-- The ticket result is fixed when the ticket is created and remains hidden
-- until the owner explicitly reveals it.
-- Safe to run more than once: batches are keyed by their name and existing
-- tickets are not duplicated.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_transitions;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_transitions CHECK (
    (status = 'CREATED' AND owner_id IS NULL) OR
    (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL) OR
    (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL) OR
    (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND redeemed_at IS NOT NULL)
);

DO $$
DECLARE
    v_batch_id UUID;
    v_price BIGINT;
    v_max_prize BIGINT;
    v_name TEXT;
    v_i INTEGER;
    v_draw INTEGER;
    v_prize BIGINT;
    v_tier INTEGER;
    v_public_id TEXT;
BEGIN
    FOR v_name, v_price, v_max_prize IN
        VALUES
            ('Bronze', 50, 5000),
            ('Silver', 250, 25000),
            ('Gold', 500, 50000),
            ('Platinum', 1000, 100000)
    LOOP
        SELECT id INTO v_batch_id FROM ticket_batches WHERE name = v_name AND ticket_price = v_price AND status = 'PUBLISHED' LIMIT 1;

        IF v_batch_id IS NULL THEN
            INSERT INTO ticket_batches
                (name, ticket_price, total_tickets, win_rate, max_prize, status, is_locked, published_at, sales_start_at)
            VALUES
                (v_name, v_price, 100, 0.2000, v_max_prize, 'PUBLISHED', FALSE, NOW(), NOW())
            RETURNING id INTO v_batch_id;
        END IF;

        FOR v_i IN 1..100 LOOP
            v_public_id := 'AZK-' || UPPER(v_name) || '-' || LPAD(v_i::TEXT, 4, '0');

            IF NOT EXISTS (SELECT 1 FROM tickets WHERE public_id = v_public_id) THEN
                v_draw := (get_byte(gen_random_bytes(1), 0) % 100);
                IF v_draw < 80 THEN
                    v_prize := 0;
                    v_tier := 0;
                ELSIF v_draw < 95 THEN
                    v_prize := v_price * 2;
                    v_tier := 1;
                ELSIF v_draw < 99 THEN
                    v_prize := GREATEST(v_price * 10, v_max_prize / 10);
                    v_tier := 2;
                ELSE
                    v_prize := v_max_prize;
                    v_tier := 3;
                END IF;

                INSERT INTO tickets
                    (batch_id, public_id, secret_hash, type, status, price, prize_amount, prize_tier)
                VALUES
                    (v_batch_id, v_public_id,
                     encode(digest(v_public_id || ':' || encode(gen_random_bytes(16), 'hex'), 'sha256'), 'hex'),
                     'VIRTUAL', 'CREATED', v_price, v_prize, v_tier);
            END IF;
        END LOOP;
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_created_price ON tickets(price) WHERE status = 'CREATED';
CREATE INDEX IF NOT EXISTS idx_deposits_provider_confirmation ON deposits(provider_confirmation_code);
