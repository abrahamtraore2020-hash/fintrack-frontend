-- Contenu de la mini plateforme de formation (/formation).
-- RLS activée sans politique : seul le service role (routes API protégées) y accède.
create table if not exists public.formation_episodes (
  slug text primary key,
  position int not null default 0,
  titre text not null,
  resume text not null default '',
  lecons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.formation_episodes enable row level security;
