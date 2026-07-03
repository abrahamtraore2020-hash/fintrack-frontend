-- Add role column to users
alter table users add column if not exists role text check (role in ('admin', 'moderator', 'support')) default null;

-- Security definer function to read role without triggering RLS recursion
create or replace function get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from users where id = auth.uid()
$$;

-- Drop old catch-all policy
drop policy if exists "users_own" on users;

-- Recreate split policies with admin access
create policy "users_select" on users
  for select using (
    auth.uid() = id
    or get_my_role() in ('admin', 'moderator', 'support')
  );

create policy "users_insert" on users
  for insert with check (auth.uid() = id);

create policy "users_update" on users
  for update using (
    auth.uid() = id
    or get_my_role() = 'admin'
  );

create policy "users_delete" on users
  for delete using (auth.uid() = id);

-- Set owner as admin
update users set role = 'admin' where email = 'abrahamtraore2020@gmail.com';
