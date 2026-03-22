-- =====================================================================
-- Migration 007 — Client auth, favoris, avis, push, page_content
-- =====================================================================

-- ── 1. Profils clients (liés à auth.users) ──────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom      TEXT NOT NULL DEFAULT '',
  nom         TEXT NOT NULL DEFAULT '',
  telephone   TEXT,
  adresse     TEXT,
  locale      TEXT NOT NULL DEFAULT 'fr',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur peut lire son propre profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilisateur peut modifier son propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger : créer automatiquement un profil après inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, nom, telephone, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    NEW.raw_user_meta_data->>'telephone',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'fr')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. Lier les commandes aux utilisateurs ───────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- ── 3. Favoris ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoris (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère ses favoris"
  ON favoris FOR ALL
  USING (auth.uid() = user_id);

-- ── 4. Avis produits ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  note        INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  approuve    BOOLEAN NOT NULL DEFAULT FALSE,
  locale      TEXT NOT NULL DEFAULT 'fr',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des avis approuvés (public)"
  ON avis FOR SELECT
  USING (approuve = TRUE);

CREATE POLICY "Utilisateur peut créer un avis"
  ON avis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut lire ses propres avis"
  ON avis FOR SELECT
  USING (auth.uid() = user_id);

-- ── 5. Push subscriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint  TEXT NOT NULL UNIQUE,
  p256dh    TEXT NOT NULL,
  auth_key  TEXT NOT NULL,
  locale    TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère ses subscriptions push"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ── 6. Contenu de la page d'accueil ──────────────────────────────────
CREATE TABLE IF NOT EXISTS page_content (
  cle       TEXT PRIMARY KEY,
  valeur_fr TEXT NOT NULL DEFAULT '',
  valeur_pt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Données initiales
INSERT INTO page_content (cle, valeur_fr, valeur_pt) VALUES
  ('hero_titre',      'La Ferme de Marie à Rio',                            'A Fazenda da Marie no Rio'),
  ('hero_sous_titre', 'Produits fermiers frais, livrés chez vous',          'Produtos frescos da fazenda, entregues na sua porta'),
  ('description',     'Produits frais de saison, cueillis avec soin à la ferme de Marie.', 'Produtos frescos da estação, colhidos com cuidado na fazenda da Marie.'),
  ('annonce',         '',                                                   '')
ON CONFLICT (cle) DO NOTHING;
