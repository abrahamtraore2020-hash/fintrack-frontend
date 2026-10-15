-- Plusieurs formateurs : chacun a son espace (formations, directs, exercices, ateliers).
-- Le propriétaire actuel de la plateforme devient le formateur « administrateur » (identifiant fixe).
-- RLS activée sans politique : seules les routes API (service role) y accèdent.
create table if not exists public.formation_formateurs (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  nom text not null default '',
  password_hash text,
  salt text,
  slug text not null unique,
  est_admin boolean not null default false,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.formation_formateurs enable row level security;

insert into public.formation_formateurs (id, slug, nom, est_admin)
values ('00000000-0000-0000-0000-000000000001', 'lion-attitude', coalesce((select display_name from public.formation_settings where id = 1), ''), true)
on conflict (id) do nothing;

-- Invitations : l'administrateur crée un lien, le futur formateur s'inscrit avec.
create table if not exists public.formation_invitations (
  code text primary key,
  nom text not null default '',
  created_at timestamptz not null default now(),
  utilisee_par uuid references public.formation_formateurs(id) on delete set null,
  utilisee_le timestamptz
);
alter table public.formation_invitations enable row level security;

-- Chaque formation appartient à un formateur (les formations existantes restent à l'administrateur).
alter table public.formation_formations
  add column if not exists formateur_id uuid not null default '00000000-0000-0000-0000-000000000001'
  references public.formation_formateurs(id) on delete cascade;
create index if not exists formation_formations_formateur_idx on public.formation_formations (formateur_id);
