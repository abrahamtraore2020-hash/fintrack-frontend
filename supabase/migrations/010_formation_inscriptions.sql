-- Inscriptions des participants aux directs (page publique /direct/[id]).
-- RLS activée sans politique : seules les routes API (service role) y accèdent.
create table if not exists public.formation_inscriptions (
  id uuid primary key default gen_random_uuid(),
  direct_id text not null,
  nom text not null,
  contact text not null,
  canal text not null check (canal in ('whatsapp', 'email')),
  created_at timestamptz not null default now(),
  unique (direct_id, contact)
);
create index if not exists formation_inscriptions_direct_idx on public.formation_inscriptions (direct_id);
alter table public.formation_inscriptions enable row level security;
