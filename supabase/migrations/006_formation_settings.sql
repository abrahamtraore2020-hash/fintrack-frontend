-- Mot de passe formateur de /formation (haché, créé depuis la plateforme).
create table if not exists public.formation_settings (
  id int primary key default 1 check (id = 1),
  password_hash text not null,
  salt text not null,
  updated_at timestamptz not null default now()
);

alter table public.formation_settings enable row level security;
