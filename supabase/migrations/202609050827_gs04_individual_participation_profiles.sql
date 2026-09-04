-- GLOBAL SPARK GS-04 · v3.56.0
-- Direct personal participation profile without changing spark_members.center_id semantics.

create table if not exists public.spark_individual_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  participant_type text not null default 'individual' check (participant_type in ('individual','parent')),
  country_code text not null default 'KR' check (char_length(country_code) between 2 and 8),
  region_name text,
  status text not null default 'active' check (status in ('active','paused','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(auth_user_id)
);

alter table public.spark_individual_profiles enable row level security;
grant select, insert, update on public.spark_individual_profiles to authenticated;
revoke all on public.spark_individual_profiles from anon;

create policy "individual_profile_select_own"
on public.spark_individual_profiles for select to authenticated
using ((select auth.uid()) = auth_user_id);

create policy "individual_profile_insert_own"
on public.spark_individual_profiles for insert to authenticated
with check ((select auth.uid()) = auth_user_id);

create policy "individual_profile_update_own"
on public.spark_individual_profiles for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create or replace function public.spark_my_individual_profile()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select to_jsonb(p) from public.spark_individual_profiles p
  where p.auth_user_id = (select auth.uid()) limit 1;
$$;

create or replace function public.spark_upsert_individual_profile(
  p_display_name text,
  p_participant_type text default 'individual',
  p_country_code text default 'KR',
  p_region_name text default null
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_row public.spark_individual_profiles;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if nullif(trim(coalesce(p_display_name,'')), '') is null then raise exception 'DISPLAY_NAME_REQUIRED'; end if;
  if p_participant_type not in ('individual','parent') then raise exception 'INVALID_PARTICIPANT_TYPE'; end if;
  insert into public.spark_individual_profiles(auth_user_id,display_name,participant_type,country_code,region_name)
  values(v_uid,trim(p_display_name),p_participant_type,upper(coalesce(nullif(trim(p_country_code),''),'KR')),nullif(trim(coalesce(p_region_name,'')),''))
  on conflict(auth_user_id) do update set display_name=excluded.display_name,participant_type=excluded.participant_type,country_code=excluded.country_code,region_name=excluded.region_name,updated_at=now()
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;

revoke all on function public.spark_my_individual_profile() from public, anon;
revoke all on function public.spark_upsert_individual_profile(text,text,text,text) from public, anon;
grant execute on function public.spark_my_individual_profile() to authenticated;
grant execute on function public.spark_upsert_individual_profile(text,text,text,text) to authenticated;
