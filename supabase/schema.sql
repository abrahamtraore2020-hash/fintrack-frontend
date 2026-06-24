-- Users
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  first_name text not null,
  last_name text not null,
  avatar text,
  profile text default 'personal' check (profile in ('personal','freelance','business','enterprise')),
  plan text default 'starter' check (plan in ('starter','pro','business','enterprise')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  currency text default 'XOF' check (currency in ('XOF','USD','EUR')),
  lang text default 'fr' check (lang in ('fr','en')),
  created_at timestamptz default now()
);

-- Accounts (comptes connectés)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('mobile_money','bank','platform','custom')),
  provider text,
  name text not null,
  balance numeric default 0,
  currency text default 'XOF',
  is_connected boolean default false,
  last_sync timestamptz,
  api_key text,
  webhook_url text,
  created_at timestamptz default now()
);

-- Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  account_id uuid references accounts(id),
  type text check (type in ('income','expense','transfer')),
  amount numeric not null,
  currency text default 'XOF',
  category text check (category in ('food','transport','housing','health','entertainment','salary','freelance','investment','shopping','utilities','education','other')),
  description text,
  date date not null,
  coffre_id uuid,
  is_recurring boolean default false,
  recurring_period text,
  created_at timestamptz default now()
);

-- Coffres virtuels
create table coffres (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  icon text default '💰',
  color text default '#FFD700',
  target_amount numeric not null,
  current_amount numeric default 0,
  currency text default 'XOF',
  mode text check (mode in ('manual','auto','hybrid')) default 'manual',
  status text check (status in ('active','paused','completed')) default 'active',
  rule_type text check (rule_type in ('percentage','fixed')),
  rule_value numeric,
  rule_trigger text check (rule_trigger in ('each_income','monthly','weekly')),
  deadline date,
  created_at timestamptz default now()
);

-- Objectifs
create table objectifs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  coffre_id uuid references coffres(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  currency text default 'XOF',
  deadline date not null,
  status text check (status in ('on_track','at_risk','completed','overdue')) default 'on_track',
  ai_advice text,
  created_at timestamptz default now()
);

-- Alarmes
create table alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('expense_threshold','balance_low','periodic_reminder','coffre_milestone','deadline','income_received')),
  name text not null,
  description text,
  condition jsonb,
  channels text[] default array['email','push_mobile'],
  is_active boolean default true,
  schedule text,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  alarm_id uuid references alarms(id),
  title text not null,
  body text not null,
  type text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Abonnements
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan text not null,
  billing_period text check (billing_period in ('monthly','yearly','lifetime')),
  currency text default 'XOF',
  amount numeric not null,
  status text check (status in ('pending','success','failed','refunded')),
  provider text check (provider in ('cinetpay','stripe')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table users enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table coffres enable row level security;
alter table objectifs enable row level security;
alter table alarms enable row level security;
alter table notifications enable row level security;
alter table subscriptions enable row level security;

-- Policies
create policy "users_own" on users for all using (auth.uid() = id);
create policy "accounts_own" on accounts for all using (auth.uid() = user_id);
create policy "transactions_own" on transactions for all using (auth.uid() = user_id);
create policy "coffres_own" on coffres for all using (auth.uid() = user_id);
create policy "objectifs_own" on objectifs for all using (auth.uid() = user_id);
create policy "alarms_own" on alarms for all using (auth.uid() = user_id);
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);
create policy "subscriptions_own" on subscriptions for all using (auth.uid() = user_id);
