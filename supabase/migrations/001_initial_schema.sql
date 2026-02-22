-- OrbCast Supabase Schema Migration
-- Run this in your Supabase SQL Editor

-- Profiles table
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  email text,
  updated_at timestamp with time zone default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Device nicknames table
create table if not exists public.device_nicknames (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  device_id text not null,
  nickname text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, device_id)
);

alter table public.device_nicknames enable row level security;

create policy "Users can manage own nicknames" on public.device_nicknames
  for all using (auth.uid() = user_id);

-- Settings table
create table if not exists public.settings (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users on delete cascade,
  audio_quality text default 'medium',
  reduce_motion boolean default false,
  last_selected_output_ids text[] default '{}',
  updated_at timestamp with time zone default now()
);

alter table public.settings enable row level security;

create policy "Users can manage own settings" on public.settings
  for all using (auth.uid() = user_id);

-- Auto-create profile + settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  insert into public.settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
