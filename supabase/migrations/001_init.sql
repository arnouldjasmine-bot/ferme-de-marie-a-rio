-- Migration initiale — La Ferme de Marie

-- Produits
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  prix numeric(10, 2) not null check (prix >= 0),
  unite text not null default 'unité',
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- Commandes
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null,
  adresse text not null,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'confirmee', 'livree', 'annulee')),
  total numeric(10, 2) not null check (total >= 0),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

-- Lignes de commande
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantite integer not null check (quantite > 0),
  prix_unitaire numeric(10, 2) not null check (prix_unitaire >= 0)
);

-- Index utiles
create index if not exists idx_orders_statut on orders(statut);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_products_actif on products(actif);

-- Sécurité RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Politique : lecture publique des produits actifs
create policy "Produits actifs visibles publiquement"
  on products for select
  using (actif = true and stock > 0);

-- Politique : insert commandes (clients non authentifiés)
create policy "Création de commande publique"
  on orders for insert
  with check (true);

create policy "Création de lignes de commande publique"
  on order_items for insert
  with check (true);

-- Politique : admin full access (service_role bypasse RLS)
