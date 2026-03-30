-- Table pour stocker les tokens de réinitialisation du mot de passe admin
CREATE TABLE IF NOT EXISTS admin_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour stocker le mot de passe admin surchargé (prioritaire sur l'env var)
CREATE TABLE IF NOT EXISTS admin_settings (
  cle TEXT PRIMARY KEY,
  valeur TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
