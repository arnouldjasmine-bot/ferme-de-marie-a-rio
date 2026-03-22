-- Colonne pour identifier les commandes MedRio (B2B)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_medrio boolean NOT NULL DEFAULT false;

-- Deuxième adresse de livraison (MedRio a 2 sites)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS adresse2 text;
