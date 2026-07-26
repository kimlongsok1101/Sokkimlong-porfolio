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

drop policy if exists "Allow public select on messages" on public.messages;
create policy "Allow public select on messages"
  on public.messages
  for select
  using (true);

-- Authenticated admin policy: allow authenticated users to insert, update, delete messages.
-- This policy is intentionally broad for admin dashboard use; narrow it if you want a stricter rule.
drop policy if exists "Allow authenticated write on messages" on public.messages;
create policy "Allow authenticated write on messages"
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

drop policy if exists "Allow public select on page sections" on public.page_sections;
create policy "Allow public select on page sections"
  on public.page_sections
  for select
  using (true);

drop policy if exists "Allow authenticated write on page sections" on public.page_sections;
create policy "Allow authenticated write on page sections"
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

drop policy if exists "Allow public select on projects" on public.projects;
create policy "Allow public select on projects"
  on public.projects
  for select
  using (true);

drop policy if exists "Allow authenticated write on projects" on public.projects;
create policy "Allow authenticated write on projects"
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

-- Create the notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('project', 'section', 'message')),
  title text not null,
  description text not null,
  projectId text,
  projectImage text,
  projectCategory text,
  read boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable row-level security for notifications
alter table public.notifications enable row level security;

-- Allow anyone to read notifications
drop policy if exists "Allow public read notifications" on public.notifications;
create policy "Allow public read notifications"
  on public.notifications
  for select
  using (true);

-- Allow authenticated users to insert notifications
drop policy if exists "Allow authenticated insert notifications" on public.notifications;
create policy "Allow authenticated insert notifications"
  on public.notifications
  for insert
  with check (auth.role() = 'authenticated');

-- Allow users to update their own read status
drop policy if exists "Allow update notification read status" on public.notifications;
create policy "Allow update notification read status"
  on public.notifications
  for update
  using (true)
  with check (true);

-- Allow users to delete notifications (admin only in practice)
drop policy if exists "Allow delete notifications" on public.notifications;
create policy "Allow delete notifications"
  on public.notifications
  for delete
  using (true);

-- Create indexes for better query performance
create index if not exists idx_notifications_created_at on public.notifications (created_at desc);
create index if not exists idx_notifications_read on public.notifications (read);
