-- Ajout statut paiement et date de livraison effective

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paiement_statut text NOT NULL DEFAULT 'en_attente'
    CHECK (paiement_statut IN ('en_attente', 'payee'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS livree_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_paiement_statut ON orders(paiement_statut);
