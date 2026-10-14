-- Exercices (QCM à 3 réponses, façon « Qui veut gagner des millions ») et résultats des élèves.
-- RLS activée sans politique : seules les routes API (service role) y accèdent.
create table if not exists public.formation_exercices (
  id uuid primary key default gen_random_uuid(),
  formation_slug text not null,
  titre text not null,
  modules jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  ouvert boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists formation_exercices_formation_idx on public.formation_exercices (formation_slug);
alter table public.formation_exercices enable row level security;

create table if not exists public.formation_resultats (
  id uuid primary key default gen_random_uuid(),
  exercice_id uuid not null references public.formation_exercices(id) on delete cascade,
  nom text not null,
  email text not null default '',
  score int not null,
  total int not null,
  note numeric(4,1) not null,
  reponses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists formation_resultats_exercice_idx on public.formation_resultats (exercice_id);
alter table public.formation_resultats enable row level security;
