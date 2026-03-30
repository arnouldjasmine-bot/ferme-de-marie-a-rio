-- Ajout colonnes bilingues produits (FR + PT-BR)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS nom_pt TEXT,
  ADD COLUMN IF NOT EXISTS description_pt TEXT;
