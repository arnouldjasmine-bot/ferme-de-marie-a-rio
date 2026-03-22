CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  value text UNIQUE NOT NULL,
  label_fr text NOT NULL,
  label_pt text NOT NULL,
  emoji text DEFAULT '🌿',
  ordre int DEFAULT 99,
  created_at timestamptz DEFAULT now()
);

INSERT INTO categories (value, label_fr, label_pt, emoji, ordre) VALUES
  ('fruits',            'Fruits',            'Frutas',     '🍍', 1),
  ('legumes',           'Légumes',           'Verduras',   '🥬', 2),
  ('confiture',         'Confitures',        'Geleias',    '🍓', 3),
  ('produits_laitiers', 'Produits laitiers', 'Laticínios', '🥛', 4)
ON CONFLICT (value) DO NOTHING;
