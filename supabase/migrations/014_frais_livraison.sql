-- Frais de livraison configurable depuis l'admin (au lieu d'être figé dans le code)
INSERT INTO page_content (cle, valeur_fr, valeur_pt) VALUES
  ('frais_livraison', '20', '20')
ON CONFLICT (cle) DO NOTHING;
