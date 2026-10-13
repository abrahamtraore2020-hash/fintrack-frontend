-- Apparence des présentations (couleurs, polices, logo, animations), par formation.
alter table public.formation_formations add column if not exists theme jsonb not null default '{}'::jsonb;
