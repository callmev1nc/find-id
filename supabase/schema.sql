-- Find ID: conversation directory
-- Run this once in the new Supabase project (SQL editor).

create table if not exists conversations (
  psid text primary key,
  page_id text not null,
  name text,
  snippet text,
  last_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists conversations_name_idx on conversations (name);
create index if not exists conversations_page_updated_idx on conversations (page_id, updated_at);

-- Access is via the service role key only (server-side), so RLS is locked down.
alter table conversations enable row level security;

create policy "service role full access"
  on conversations
  for all
  to service_role
  using (true)
  with check (true);