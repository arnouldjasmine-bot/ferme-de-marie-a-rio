-- Ajoute la FK directe avis.user_id → profiles.id
-- Nécessaire pour que PostgREST puisse faire la jointure profiles(prenom, nom)
ALTER TABLE avis
  DROP CONSTRAINT IF EXISTS avis_user_id_fkey,
  ADD CONSTRAINT avis_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
