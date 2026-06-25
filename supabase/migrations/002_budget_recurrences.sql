-- Budget par catégorie
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category text not null,
  emoji text default '📦',
  budget_limit numeric not null,
  spent numeric default 0,
  color text default '#FFD700',
  created_at timestamptz default now()
);
alter table budgets enable row level security;
create policy "budgets_own" on budgets for all using (auth.uid() = user_id);

-- Récurrences
create table if not exists recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  emoji text default '📦',
  amount numeric not null,
  type text check (type in ('expense','income')) default 'expense',
  frequency text check (frequency in ('daily','weekly','monthly','yearly')) default 'monthly',
  next_date date not null,
  category text not null,
  active boolean default true,
  account text default '',
  created_at timestamptz default now()
);
alter table recurrences enable row level security;
create policy "recurrences_own" on recurrences for all using (auth.uid() = user_id);
