-- GLOBAL SPARK GS-05 · v3.57.0
-- Parent/guardian -> child profile connection. No public child lookup.

create table if not exists public.spark_family_children (
  id uuid primary key default gen_random_uuid(),
  guardian_profile_id uuid not null references public.spark_individual_profiles(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  age_group text not null default 'unspecified' check (age_group in ('preschool','elementary','middle','high','adult','unspecified')),
  linked_member_id uuid null references public.spark_members(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.spark_family_children enable row level security;
revoke all on public.spark_family_children from public, anon;
grant select, insert, update, delete on public.spark_family_children to authenticated;

drop policy if exists spark_family_children_owner_select on public.spark_family_children;
create policy spark_family_children_owner_select on public.spark_family_children for select to authenticated
using (exists (select 1 from public.spark_individual_profiles p where p.id=guardian_profile_id and p.auth_user_id=auth.uid()));

drop policy if exists spark_family_children_owner_insert on public.spark_family_children;
create policy spark_family_children_owner_insert on public.spark_family_children for insert to authenticated
with check (exists (select 1 from public.spark_individual_profiles p where p.id=guardian_profile_id and p.auth_user_id=auth.uid() and p.participant_type='parent' and p.status='active'));

drop policy if exists spark_family_children_owner_update on public.spark_family_children;
create policy spark_family_children_owner_update on public.spark_family_children for update to authenticated
using (exists (select 1 from public.spark_individual_profiles p where p.id=guardian_profile_id and p.auth_user_id=auth.uid()))
with check (exists (select 1 from public.spark_individual_profiles p where p.id=guardian_profile_id and p.auth_user_id=auth.uid()));

drop policy if exists spark_family_children_owner_delete on public.spark_family_children;
create policy spark_family_children_owner_delete on public.spark_family_children for delete to authenticated
using (exists (select 1 from public.spark_individual_profiles p where p.id=guardian_profile_id and p.auth_user_id=auth.uid()));

create or replace function public.spark_my_family_children()
returns setof public.spark_family_children language sql stable security invoker set search_path=''
as $$ select c.* from public.spark_family_children c join public.spark_individual_profiles p on p.id=c.guardian_profile_id where p.auth_user_id=auth.uid() order by c.status='active' desc,c.created_at,c.display_name $$;

create or replace function public.spark_add_family_child(p_display_name text,p_age_group text default 'unspecified')
returns public.spark_family_children language plpgsql security invoker set search_path=''
as $$ declare v_profile public.spark_individual_profiles; v_child public.spark_family_children; begin
select * into v_profile from public.spark_individual_profiles where auth_user_id=auth.uid() and status='active';
if v_profile.id is null then raise exception 'PROFILE_REQUIRED'; end if;
if v_profile.participant_type<>'parent' then raise exception 'PARENT_PROFILE_REQUIRED'; end if;
if btrim(coalesce(p_display_name,''))='' then raise exception 'DISPLAY_NAME_REQUIRED'; end if;
if coalesce(p_age_group,'unspecified') not in ('preschool','elementary','middle','high','adult','unspecified') then raise exception 'INVALID_AGE_GROUP'; end if;
insert into public.spark_family_children(guardian_profile_id,display_name,age_group) values(v_profile.id,btrim(p_display_name),coalesce(p_age_group,'unspecified')) returning * into v_child; return v_child; end $$;

create or replace function public.spark_update_family_child(p_child_id uuid,p_display_name text,p_age_group text,p_active boolean)
returns public.spark_family_children language plpgsql security invoker set search_path=''
as $$ declare v_child public.spark_family_children; begin
if btrim(coalesce(p_display_name,''))='' then raise exception 'DISPLAY_NAME_REQUIRED'; end if;
if coalesce(p_age_group,'unspecified') not in ('preschool','elementary','middle','high','adult','unspecified') then raise exception 'INVALID_AGE_GROUP'; end if;
update public.spark_family_children c set display_name=btrim(p_display_name),age_group=coalesce(p_age_group,'unspecified'),status=case when p_active then 'active' else 'inactive' end,updated_at=now()
where c.id=p_child_id and exists(select 1 from public.spark_individual_profiles p where p.id=c.guardian_profile_id and p.auth_user_id=auth.uid()) returning * into v_child;
if v_child.id is null then raise exception 'CHILD_NOT_FOUND'; end if; return v_child; end $$;

revoke all on function public.spark_my_family_children() from public,anon;
revoke all on function public.spark_add_family_child(text,text) from public,anon;
revoke all on function public.spark_update_family_child(uuid,text,text,boolean) from public,anon;
grant execute on function public.spark_my_family_children() to authenticated;
grant execute on function public.spark_add_family_child(text,text) to authenticated;
grant execute on function public.spark_update_family_child(uuid,text,text,boolean) to authenticated;