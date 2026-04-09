-- Table pour les tokens de notifications push natifs (APNs iOS / FCM Android)
-- Ces tokens sont utilisés par l'app Capacitor pour recevoir des notifications natives.
-- Différents des push_subscriptions qui sont des abonnements Web Push (navigateur).

create table if not exists device_tokens (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,            -- Token APNs (iOS) ou FCM (Android)
  platform     text not null default 'ios',     -- 'ios' | 'android'
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index sur user_id pour retrouver les appareils d'un utilisateur
create index if not exists device_tokens_user_id_idx on device_tokens(user_id);

-- RLS : seul le service role peut lire/écrire (pas de lecture client directe)
alter table device_tokens enable row level security;

-- Politique : l'app peut insérer/mettre à jour son propre token
-- (via l'API route qui utilise le service client → pas de RLS needed côté API)
-- On bloque tout accès direct depuis le client Supabase
create policy "no_direct_client_access" on device_tokens
  for all
  using (false);
