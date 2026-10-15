-- Ateliers « Comprendre son persona » (lien pour les étudiants) et fiches remplies par les étudiants.
-- RLS activée sans politique : seules les routes API (service role) y accèdent.
create table if not exists public.formation_ateliers (
  id uuid primary key default gen_random_uuid(),
  formation_slug text not null,
  titre text not null,
  ouvert boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists formation_ateliers_formation_idx on public.formation_ateliers (formation_slug);
alter table public.formation_ateliers enable row level security;

create table if not exists public.formation_personas (
  id uuid primary key default gen_random_uuid(),
  atelier_id uuid not null references public.formation_ateliers(id) on delete cascade,
  cle text not null,
  nom text not null,
  email text not null,
  data jsonb not null default '{}'::jsonb,
  generations int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists formation_personas_atelier_idx on public.formation_personas (atelier_id);
alter table public.formation_personas enable row level security;
