-- Applied to the DAILY-FIFTY Supabase project (majxhqnyzvnbwkkcpaxw), not
-- this app's own project. Kept here for reference/version control only.
--
-- Narrow, read-only function so the separate focus-workspace app can check
-- "how many of today's 50 are done" without granting broad table access.
-- SECURITY DEFINER so it can read past the existing RLS policies on
-- daily_fifty_daily_sessions / daily_fifty_daily_answers; it only ever
-- returns aggregate counts for today, never row-level content.
create or replace function public.focus_app_daily_progress()
returns table (
  session_date date,
  total_planned int,
  completed_count int
)
language sql
security definer
set search_path = public
as $$
  select
    s.session_date,
    coalesce(jsonb_array_length(s.plan), 0) as total_planned,
    coalesce((
      select count(*)::int
      from daily_fifty_daily_answers a
      where a.session_date = s.session_date and a.completed = true
    ), 0) as completed_count
  from daily_fifty_daily_sessions s
  where s.session_date = current_date;
$$;

revoke all on function public.focus_app_daily_progress() from public;
grant execute on function public.focus_app_daily_progress() to anon, authenticated;
