-- ============================================================
-- FunTwit Posts
-- ============================================================
create table if not exists funtwit_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade not null,
  content     text not null,
  badge       jsonb,
  media       jsonb,
  hashtags    text[] default '{}',
  color       text default '#06D6A0',
  location    text,
  reactions   jsonb default '{"like":[],"love":[],"haha":[],"wow":[],"fire":[]}',
  shares      int default 0,
  created_at  timestamptz default now()
);

alter table funtwit_posts enable row level security;

-- Tout utilisateur connecté peut lire les posts (fil social public)
create policy "funtwit_posts_select" on funtwit_posts
  for select using (auth.role() = 'authenticated');

-- On ne peut créer que ses propres posts
create policy "funtwit_posts_insert" on funtwit_posts
  for insert with check (auth.uid() = user_id);

-- Tout utilisateur connecté peut mettre à jour (reactions + shares d'autres users)
create policy "funtwit_posts_update" on funtwit_posts
  for update using (auth.role() = 'authenticated');

-- On ne peut supprimer que ses propres posts
create policy "funtwit_posts_delete" on funtwit_posts
  for delete using (auth.uid() = user_id);


-- ============================================================
-- FunTwit Comments
-- ============================================================
create table if not exists funtwit_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references funtwit_posts(id) on delete cascade not null,
  user_id     uuid references users(id) on delete cascade not null,
  content     text not null,
  likes       int default 0,
  created_at  timestamptz default now()
);

alter table funtwit_comments enable row level security;

create policy "funtwit_comments_select" on funtwit_comments
  for select using (auth.role() = 'authenticated');

create policy "funtwit_comments_insert" on funtwit_comments
  for insert with check (auth.uid() = user_id);

create policy "funtwit_comments_delete" on funtwit_comments
  for delete using (auth.uid() = user_id);


-- ============================================================
-- Conversations (Inbox / Messages)
-- ============================================================
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid references users(id) on delete cascade not null,
  user2_id    uuid references users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique (user1_id, user2_id)
);

alter table conversations enable row level security;

create policy "conversations_select" on conversations
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "conversations_insert" on conversations
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);


-- ============================================================
-- Messages
-- ============================================================
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id       uuid references users(id) on delete cascade not null,
  content         text,
  media           jsonb,
  read            boolean default false,
  created_at      timestamptz default now()
);

alter table messages enable row level security;

create policy "messages_select" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
    )
  );

create policy "messages_insert" on messages
  for insert with check (auth.uid() = sender_id);

create policy "messages_update" on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
    )
  );
