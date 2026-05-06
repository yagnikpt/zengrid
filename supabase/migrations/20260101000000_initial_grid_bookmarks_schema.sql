-- Grid Bookmarks Supabase schema
-- Run in Supabase SQL editor or via Supabase CLI against the `grid_bookmarks` project.

create extension if not exists pgcrypto;

-- ── Shared timestamp helper ────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── User settings ──────────────────────────────────────────────────────────

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grid_cols integer not null default 10 check (grid_cols between 1 and 30),
  grid_rows integer not null default 20 check (grid_rows between 1 and 50),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

-- ── Grid cells ─────────────────────────────────────────────────────────────
-- Cell position is row/column based instead of a single index so changing the
-- number of columns does not shift existing cells.

create table if not exists public.grid_cells (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  row integer not null check (row >= 0),
  col integer not null check (col >= 0),
  cell_type text not null default 'empty' check (cell_type in ('empty', 'bookmark', 'label')),
  url text,
  title text,
  favicon text,
  label_text text,
  emoji text,
  accent_color text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint grid_cells_unique_position unique (user_id, row, col),
  constraint grid_cells_bookmark_fields check (
    cell_type <> 'bookmark'
    or (url is not null and title is not null)
  ),
  constraint grid_cells_label_fields check (
    cell_type <> 'label'
    or (label_text is not null and emoji is not null)
  )
);

create index if not exists grid_cells_user_position_idx
on public.grid_cells (user_id, row, col);

create index if not exists grid_cells_user_updated_at_idx
on public.grid_cells (user_id, updated_at desc);

create trigger set_grid_cells_updated_at
before update on public.grid_cells
for each row
execute function public.set_updated_at();

-- ── Row level security ─────────────────────────────────────────────────────

alter table public.user_settings enable row level security;
alter table public.grid_cells enable row level security;

create policy "Users can read their own settings"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own settings"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own settings"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own settings"
on public.user_settings
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own cells"
on public.grid_cells
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own cells"
on public.grid_cells
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own cells"
on public.grid_cells
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own cells"
on public.grid_cells
for delete
to authenticated
using (auth.uid() = user_id);

-- ── Convenience defaults for newly-created auth users ──────────────────────

create or replace function public.handle_new_user_grid_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grid_defaults on auth.users;

create trigger on_auth_user_created_grid_defaults
after insert on auth.users
for each row
execute function public.handle_new_user_grid_defaults();
