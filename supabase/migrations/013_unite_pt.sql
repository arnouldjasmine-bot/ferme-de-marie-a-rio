-- Ajout de la version portugaise de l'unité (ex: "Pot de 250g" -> "Pote de 250g")
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unite_pt TEXT;
