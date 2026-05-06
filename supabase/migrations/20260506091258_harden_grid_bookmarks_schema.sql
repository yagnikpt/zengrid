-- Harden Grid Bookmarks schema based on Supabase advisors.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user_grid_defaults() from public;
revoke execute on function public.handle_new_user_grid_defaults() from anon;
revoke execute on function public.handle_new_user_grid_defaults() from authenticated;

alter policy "Users can read their own settings"
on public.user_settings
using ((select auth.uid()) = user_id);

alter policy "Users can insert their own settings"
on public.user_settings
with check ((select auth.uid()) = user_id);

alter policy "Users can update their own settings"
on public.user_settings
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own settings"
on public.user_settings
using ((select auth.uid()) = user_id);

alter policy "Users can read their own cells"
on public.grid_cells
using ((select auth.uid()) = user_id);

alter policy "Users can insert their own cells"
on public.grid_cells
with check ((select auth.uid()) = user_id);

alter policy "Users can update their own cells"
on public.grid_cells
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own cells"
on public.grid_cells
using ((select auth.uid()) = user_id);

