-- Profil utilisateur et coordonnées de retrait persistantes.
-- Les informations restent liées au compte et ne sont jamais exposées publiquement.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_phone VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS moncash_phone VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS natcash_phone VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_profile_updated_at ON users(profile_updated_at);
