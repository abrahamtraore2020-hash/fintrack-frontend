-- Séances en direct (Google Meet…) programmées pour chaque formation.
alter table public.formation_formations add column if not exists directs jsonb not null default '[]'::jsonb;
