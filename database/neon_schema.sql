-- ============================================================
-- AZAKA CHANS - Schéma de Base de Données Neon PostgreSQL
-- Version: 1.0.0
-- Date: 2024
-- Description: Schéma complet pour la plateforme de loterie
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour le chiffrement pgcrypto (optionnel mais recommandé)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TYPES PERSONNALISÉS
-- ============================================================

-- Type pour les rôles utilisateur
DO $type$
BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'DISTRIBUTOR', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- Type pour le statut de vérification email
DO $type$
BEGIN
    CREATE TYPE email_verification_status AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- Type pour les méthodes de paiement
DO $type$
BEGIN
    CREATE TYPE payment_method AS ENUM ('MONCASH', 'NATCASH', 'BANK');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- Type pour les statuts de transaction
DO $type$
BEGIN
    CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- Type pour les statuts de ticket
DO $type$
BEGIN
    CREATE TYPE ticket_status AS ENUM ('CREATED', 'SOLD', 'REVEALED', 'REDEEMED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- Type pour les types de ticket
DO $type$
BEGIN
    CREATE TYPE ticket_type AS ENUM ('PHYSICAL', 'VIRTUAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$type$;

-- ============================================================
-- TABLE: users
-- Description: Utilisateurs de la plateforme
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_normalized VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'USER',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_password_hash_not_empty CHECK (password_hash <> ''),
    CONSTRAINT users_password_salt_not_empty CHECK (password_salt <> '')
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email_normalized);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: email_verifications
-- Description: Codes de vérification d'email
-- ============================================================

CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_code VARCHAR(6) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    status email_verification_status NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    invalidated_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT email_verifications_code_length CHECK (LENGTH(verification_code) = 6),
    CONSTRAINT email_verifications_attempts_check CHECK (attempts >= 0 AND attempts <= max_attempts),
    CONSTRAINT email_verifications_expires_after_created CHECK (expires_at > created_at)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_status ON email_verifications(status);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_created_at ON email_verifications(created_at);

-- Index unique pour le code actif par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verifications_active_code
    ON email_verifications(user_id)
    WHERE status = 'PENDING';

-- ============================================================
-- TABLE: user_profiles
-- Description: Profils utilisateurs étendus
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Haïti',
    postal_code VARCHAR(20),
    identification_type VARCHAR(50),
    identification_number VARCHAR(100),
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    preferred_language VARCHAR(10) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'America/Port-au-Prince',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT user_profiles_country_check CHECK (LENGTH(country) > 0)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_verified ON user_profiles(kyc_verified);

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: wallets
-- Description: Portefeuilles utilisateurs
-- ============================================================

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'HTG',
    total_deposits BIGINT NOT NULL DEFAULT 0 CHECK (total_deposits >= 0),
    total_withdrawals BIGINT NOT NULL DEFAULT 0 CHECK (total_withdrawals >= 0),
    total_winnings BIGINT NOT NULL DEFAULT 0 CHECK (total_winnings >= 0),
    reserved_amount BIGINT NOT NULL DEFAULT 0 CHECK (reserved_amount >= 0),
    available_balance BIGINT GENERATED ALWAYS AS (balance - reserved_amount) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT wallets_currency_check CHECK (currency IN ('HTG', 'USD')),
    CONSTRAINT wallets_balance_not_negative CHECK (balance >= 0),
    CONSTRAINT wallets_reserved_not_exceed_balance CHECK (reserved_amount <= balance)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: ticket_batches
-- Description: Lots de tickets (séries)
-- ============================================================

CREATE TABLE IF NOT EXISTS ticket_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ticket_price BIGINT NOT NULL CHECK (ticket_price > 0),
    total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
    win_rate DECIMAL(5,4) NOT NULL CHECK (win_rate >= 0 AND win_rate <= 1),
    max_prize BIGINT NOT NULL CHECK (max_prize > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    result_seed_hash VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    sales_start_at TIMESTAMP WITH TIME ZONE,
    sales_end_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Contraintes
    CONSTRAINT ticket_batches_status_check CHECK (status IN ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'SUSPENDED', 'CLOSED')),
    CONSTRAINT ticket_batches_dates_check CHECK (
        (published_at IS NULL AND sales_start_at IS NULL) OR
        (published_at IS NOT NULL AND sales_start_at IS NOT NULL AND published_at <= sales_start_at)
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_ticket_batches_status ON ticket_batches(status);
CREATE INDEX IF NOT EXISTS idx_ticket_batches_created_at ON ticket_batches(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_batches_published_at ON ticket_batches(published_at);

-- ============================================================
-- TABLE: tickets
-- Description: Tickets individuels
-- ============================================================

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES ticket_batches(id) ON DELETE CASCADE,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    secret_hash VARCHAR(255) NOT NULL,
    type ticket_type NOT NULL,
    status ticket_status NOT NULL DEFAULT 'CREATED',
    price BIGINT NOT NULL CHECK (price > 0),
    prize_amount BIGINT CHECK (prize_amount IS NULL OR prize_amount >= 0),
    prize_tier INTEGER CHECK (prize_tier IS NULL OR prize_tier >= 0),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    purchased_at TIMESTAMP WITH TIME ZONE,
    revealed_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT tickets_status_transitions CHECK (
        (status = 'CREATED' AND owner_id IS NULL AND prize_amount IS NULL) OR
        (status = 'SOLD' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL) OR
        (status = 'REVEALED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND revealed_at IS NOT NULL) OR
        (status = 'REDEEMED' AND owner_id IS NOT NULL AND prize_amount IS NOT NULL AND redeemed_at IS NOT NULL)
    ),
    CONSTRAINT tickets_dates_order CHECK (
        (purchased_at IS NULL AND revealed_at IS NULL AND redeemed_at IS NULL) OR
        (purchased_at IS NOT NULL AND revealed_at IS NULL AND redeemed_at IS NULL) OR
        (purchased_at IS NOT NULL AND revealed_at IS NOT NULL AND redeemed_at IS NULL AND revealed_at >= purchased_at) OR
        (purchased_at IS NOT NULL AND revealed_at IS NOT NULL AND redeemed_at IS NOT NULL AND redeemed_at >= revealed_at)
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_tickets_batch_id ON tickets(batch_id);
CREATE INDEX IF NOT EXISTS idx_tickets_owner_id ON tickets(owner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_public_id ON tickets(public_id);
CREATE INDEX IF NOT EXISTS idx_tickets_purchased_at ON tickets(purchased_at);

-- ============================================================
-- TABLE: transactions
-- Description: Registre comptable en double écriture
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    debit_account VARCHAR(255) NOT NULL,
    credit_account VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'HTG',
    reference VARCHAR(255),
    description TEXT,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT transactions_type_check CHECK (type IN (
        'DEPOSIT', 'WITHDRAWAL', 'TICKET_PURCHASE', 'WIN_CREDIT', 
        'REFUND', 'FEE', 'TRANSFER', 'ADJUSTMENT'
    )),
    CONSTRAINT transactions_currency_check CHECK (currency IN ('HTG', 'USD')),
    CONSTRAINT transactions_different_accounts CHECK (debit_account <> credit_account)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_debit_account ON transactions(debit_account);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_account ON transactions(credit_account);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);

-- ============================================================
-- TABLE: deposits
-- Description: Dépôts d'argent
-- ============================================================

CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'HTG',
    payment_method payment_method NOT NULL,
    provider_transaction_id VARCHAR(255),
    provider_confirmation_code VARCHAR(255),
    status transaction_status NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Contraintes
    CONSTRAINT deposits_currency_check CHECK (currency IN ('HTG', 'USD')),
    CONSTRAINT deposits_status_dates_check CHECK (
        (status = 'PENDING' AND confirmed_at IS NULL AND failed_at IS NULL) OR
        (status = 'COMPLETED' AND confirmed_at IS NOT NULL AND failed_at IS NULL) OR
        (status = 'FAILED' AND failed_at IS NOT NULL)
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet_id ON deposits(wallet_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_payment_method ON deposits(payment_method);
CREATE INDEX IF NOT EXISTS idx_deposits_requested_at ON deposits(requested_at);
CREATE INDEX IF NOT EXISTS idx_deposits_provider_transaction_id ON deposits(provider_transaction_id);

-- ============================================================
-- TABLE: withdrawals
-- Description: Retraits d'argent
-- ============================================================

CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'HTG',
    payment_method payment_method NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    provider_transaction_id VARCHAR(255),
    provider_confirmation_code VARCHAR(255),
    status transaction_status NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE,
    processing_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Contraintes
    CONSTRAINT withdrawals_currency_check CHECK (currency IN ('HTG', 'USD')),
    CONSTRAINT withdrawals_status_dates_check CHECK (
        (status = 'PENDING' AND validated_at IS NULL AND processing_at IS NULL AND completed_at IS NULL AND failed_at IS NULL) OR
        (status = 'COMPLETED' AND completed_at IS NOT NULL AND failed_at IS NULL) OR
        (status = 'FAILED' AND failed_at IS NOT NULL)
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet_id ON withdrawals(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_payment_method ON withdrawals(payment_method);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_idempotency_key ON withdrawals(idempotency_key);

-- ============================================================
-- TABLE: jackpot_state
-- Description: État du jackpot itinérant
-- ============================================================

CREATE TABLE IF NOT EXISTS jackpot_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_category INTEGER NOT NULL CHECK (current_category IN (50, 250, 500, 1000)),
    reserve_balance BIGINT NOT NULL DEFAULT 0 CHECK (reserve_balance >= 0),
    required_reserve BIGINT NOT NULL DEFAULT 100000 CHECK (required_reserve > 0),
    state VARCHAR(50) NOT NULL DEFAULT 'RESERVE_INSUFFISANTE',
    last_victory_at TIMESTAMP WITH TIME ZONE,
    last_transition_at TIMESTAMP WITH TIME ZONE,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT jackpot_state_state_check CHECK (state IN (
        'RESERVE_INSUFFISANTE', 'PRET', 'ACTIF_50', 'ACTIF_250', 
        'ACTIF_500', 'ACTIF_1000', 'VICTOIRE_EN_COURS', 
        'PAIEMENT_EN_ATTENTE', 'PAIEMENT_ECHOUE'
    ))
);

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_jackpot_state_updated_at ON jackpot_state;
CREATE TRIGGER update_jackpot_state_updated_at
    BEFORE UPDATE ON jackpot_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'état initial du jackpot
INSERT INTO jackpot_state (current_category, reserve_balance, required_reserve, state)
VALUES (50, 0, 100000, 'RESERVE_INSUFFISANTE')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE: jackpot_victories
-- Description: Victoires au jackpot
-- ============================================================

CREATE TABLE IF NOT EXISTS jackpot_victories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category INTEGER NOT NULL CHECK (category IN (50, 250, 500, 1000)),
    amount BIGINT NOT NULL CHECK (amount > 0),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method payment_method,
    payment_destination VARCHAR(255),
    provider_transaction_id VARCHAR(255),
    won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Contraintes
    CONSTRAINT jackpot_victories_payment_status_check CHECK (payment_status IN (
        'PENDING', 'PROCESSING', 'PAID', 'FAILED'
    ))
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_jackpot_victories_ticket_id ON jackpot_victories(ticket_id);
CREATE INDEX IF NOT EXISTS idx_jackpot_victories_user_id ON jackpot_victories(user_id);
CREATE INDEX IF NOT EXISTS idx_jackpot_victories_payment_status ON jackpot_victories(payment_status);
CREATE INDEX IF NOT EXISTS idx_jackpot_victories_won_at ON jackpot_victories(won_at);

-- ============================================================
-- TABLE: audit_logs
-- Description: Journal d'audit pour la traçabilité
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT audit_logs_action_not_empty CHECK (action <> ''),
    CONSTRAINT audit_logs_resource_type_not_empty CHECK (resource_type <> '')
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- ============================================================
-- TABLE: sessions
-- Description: Sessions utilisateur
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Contraintes
    CONSTRAINT sessions_token_not_empty CHECK (token <> ''),
    CONSTRAINT sessions_expires_after_created CHECK (expires_at > created_at)
);

-- ============================================================
-- COMPATIBILITÉ DES SCHÉMAS DÉJÀ EXISTANTS
-- CREATE TABLE IF NOT EXISTS ne met pas à jour une table ancienne.
-- Ces ALTER sont additifs et peuvent être exécutés plusieurs fois.
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id_compat ON user_profiles(user_id);

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS balance BIGINT NOT NULL DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'HTG';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_deposits BIGINT NOT NULL DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawals BIGINT NOT NULL DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_winnings BIGINT NOT NULL DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS reserved_amount BIGINT NOT NULL DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS available_balance BIGINT GENERATED ALWAYS AS (balance - reserved_amount) STORED;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_compat ON wallets(user_id);


-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue pour les utilisateurs avec leur portefeuille
CREATE OR REPLACE VIEW user_wallets AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.email_verified,
    u.is_active,
    COALESCE(w.balance, 0) AS balance,
    COALESCE(w.available_balance, 0) AS available_balance,
    COALESCE(w.total_deposits, 0) AS total_deposits,
    COALESCE(w.total_withdrawals, 0) AS total_withdrawals,
    COALESCE(w.total_winnings, 0) AS total_winnings
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.is_active = TRUE;

-- Vue pour les tickets avec les informations du lot
CREATE OR REPLACE VIEW tickets_with_batches AS
SELECT 
    t.*,
    tb.name AS batch_name,
    tb.ticket_price AS batch_price,
    tb.status AS batch_status
FROM tickets t
JOIN ticket_batches tb ON t.batch_id = tb.id;

-- Vue pour les transactions récentes
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.*,
    CASE 
        WHEN t.credit_account LIKE 'user-%' THEN 'CREDIT'
        WHEN t.debit_account LIKE 'user-%' THEN 'DEBIT'
        ELSE 'SYSTEM'
    END AS transaction_direction
FROM transactions t
WHERE t.created_at >= NOW() - INTERVAL '30 days'
ORDER BY t.created_at DESC;

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Fonction pour vérifier si un email existe
CREATE OR REPLACE FUNCTION check_email_exists(p_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE email_normalized = LOWER(p_email)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le solde du portefeuille
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_wallet_id UUID,
    p_amount BIGINT,
    p_transaction_type VARCHAR
)
RETURNS VOID AS $$
BEGIN
    UPDATE wallets
    SET 
        balance = balance + p_amount,
        updated_at = NOW()
    WHERE id = p_wallet_id;
    
    -- Mettre à jour les totaux selon le type de transaction
    IF p_transaction_type = 'DEPOSIT' THEN
        UPDATE wallets SET total_deposits = total_deposits + p_amount WHERE id = p_wallet_id;
    ELSIF p_transaction_type = 'WITHDRAWAL' THEN
        UPDATE wallets SET total_withdrawals = total_withdrawals + p_amount WHERE id = p_wallet_id;
    ELSIF p_transaction_type = 'WIN_CREDIT' THEN
        UPDATE wallets SET total_winnings = total_winnings + p_amount WHERE id = p_wallet_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une transaction en double écriture
CREATE OR REPLACE FUNCTION create_double_entry_transaction(
    p_type VARCHAR,
    p_debit_account VARCHAR,
    p_credit_account VARCHAR,
    p_amount BIGINT,
    p_reference VARCHAR,
    p_description TEXT,
    p_idempotency_key VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Vérifier l'idempotence
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM transactions WHERE idempotency_key = p_idempotency_key
    ) THEN
        RAISE EXCEPTION 'Transaction avec cette clé d''idempotence existe déjà';
    END IF;
    
    -- Créer la transaction
    INSERT INTO transactions (
        type, debit_account, credit_account, amount, 
        reference, description, status, idempotency_key, completed_at
    ) VALUES (
        p_type, p_debit_account, p_credit_account, p_amount,
        p_reference, p_description, 'COMPLETED', p_idempotency_key, NOW()
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PERMISSIONS ET SÉCURITÉ
-- ============================================================

-- Ne pas créer ici un rôle applicatif avec un mot de passe par défaut.
-- Sur Neon, configurez un rôle dédié depuis la console Neon, puis utilisez
-- sa chaîne de connexion dans DATABASE_URL côté serveur uniquement.
-- N'accordez pas de privilèges de superutilisateur au rôle applicatif.
-- Si vous créez un rôle dédié, accordez-lui uniquement les permissions
-- minimales nécessaires aux tables/fonctions réellement utilisées.

-- ============================================================
-- FIN DU SCHÉMA
-- ============================================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Schéma AZAKA CHANS créé avec succès!';
    RAISE NOTICE 'Version: 1.0.0';
    RAISE NOTICE 'Date: %', NOW();
END
$$;
