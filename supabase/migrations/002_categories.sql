-- Ajout de la colonne catégorie aux produits
alter table products
  add column if not exists categorie text
    check (categorie in ('fruits', 'legumes', 'confiture', 'produits_laitiers'));

create index if not exists idx_products_categorie on products(categorie);
