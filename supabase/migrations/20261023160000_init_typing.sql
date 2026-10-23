-- Player profiles and typing runs. Apply after the Supabase project exists.
-- Leaderboard queries stay out of this migration until auth is wired.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'pemain',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 3 and 24)
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('word_rush', 'letter_fall', 'combo')),
  wpm integer not null check (wpm >= 0 and wpm <= 400),
  accuracy numeric(5, 2) not null check (accuracy >= 0 and accuracy <= 100),
  duration_ms integer not null check (duration_ms > 0 and duration_ms <= 600000),
  created_at timestamptz not null default now()
);

create index runs_user_created_idx on public.runs (user_id, created_at desc);
create index runs_mode_wpm_idx on public.runs (mode, wpm desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.runs enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.runs to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy runs_select_own on public.runs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy runs_insert_own on public.runs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
