-- Correction colonnes produits : bilingue + assure que stock est bien INTEGER sans contrainte bloquante
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS nom_pt TEXT,
  ADD COLUMN IF NOT EXISTS description_pt TEXT;

-- S'assurer que stock n'a pas de contrainte NOT NULL stricte sans défaut
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;
