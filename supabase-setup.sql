-- Supabase setup for the `messages` table and row-level security policies.
-- Run this in the Supabase SQL editor if your database already has the table, or create the table manually first.

-- Create the messages table if it does not already exist.
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable row-level security for the messages table.
alter table public.messages enable row level security;

-- Public read policy: allow anyone to select messages.
create policy if not exists "Allow public select on messages"
  on public.messages
  for select
  using (true);

-- Authenticated admin policy: allow authenticated users to insert, update, delete messages.
-- This policy is intentionally broad for admin dashboard use; narrow it if you want a stricter rule.
create policy if not exists "Allow authenticated write on messages"
  on public.messages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create the page_sections table if it does not already exist.
create table if not exists public.page_sections (
  section text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);

alter table public.page_sections enable row level security;

create policy if not exists "Allow public select on page sections"
  on public.page_sections
  for select
  using (true);

create policy if not exists "Allow authenticated write on page sections"
  on public.page_sections
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create the projects table if it does not already exist.
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  fullDetails text,
  category text not null,
  tags text[] not null default '{}',
  image text,
  demoUrl text,
  githubUrl text,
  featured boolean default false,
  rating numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy if not exists "Allow public select on projects"
  on public.projects
  for select
  using (true);

create policy if not exists "Allow authenticated write on projects"
  on public.projects
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- If you want to restrict writes to a single admin email, use this instead:
-- create policy "Allow admin writes on messages"
--   on public.messages
--   for insert, update, delete
--   using (auth.role() = 'authenticated' and auth.email() = 'kimlongsok1101@gmail.com')
--   with check (auth.role() = 'authenticated' and auth.email() = 'kimlongsok1101@gmail.com');
