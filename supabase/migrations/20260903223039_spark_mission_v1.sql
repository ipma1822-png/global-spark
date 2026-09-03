-- GLOBAL SPARK PHASE 2-3 · SPARK MISSION v1.0
-- This migration mirrors the production migration already applied to Supabase.

create table if not exists public.spark_missions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) >= 2 and length(title) <= 100),
  description text not null check (length(description) >= 2 and length(description) <= 1000),
  flame_code text not null check (flame_code in ('GOOD','SAFE','EARTH','CHALLENGE','CITIZEN')),
  target_label text not null default '모두',
  difficulty text not null default 'easy' check (difficulty in ('easy','normal','challenge')),
  participation_type text not null default 'solo' check (participation_type in ('solo','friends','family','center','community')),
  safety_guide text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','ended')),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.spark_mission_completions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.spark_missions(id),
  member_id uuid not null references public.spark_members(id),
  verified_by uuid not null default auth.uid(),
  completed_at timestamptz not null default now(),
  unique(mission_id, member_id)
);

alter table public.spark_missions enable row level security;
alter table public.spark_mission_completions enable row level security;

create or replace function public.spark_public_missions(p_limit integer default 12)
returns table(id uuid,title text,description text,flame_code text,target_label text,difficulty text,participation_type text,safety_guide text,starts_at timestamptz,ends_at timestamptz)
language sql stable security definer set search_path='public'
as $$
 select m.id,m.title,m.description,m.flame_code,m.target_label,m.difficulty,m.participation_type,m.safety_guide,m.starts_at,m.ends_at
 from public.spark_missions m
 where m.status='published' and m.starts_at<=now() and (m.ends_at is null or m.ends_at>=now())
 order by m.starts_at desc limit greatest(1,least(coalesce(p_limit,12),30));
$$;

create or replace function public.spark_member_missions(p_member_id uuid)
returns table(id uuid,title text,description text,flame_code text,target_label text,difficulty text,participation_type text,safety_guide text,starts_at timestamptz,ends_at timestamptz,completed boolean)
language plpgsql stable security definer set search_path='public'
as $$
declare v_center uuid;
begin
 select center_id into v_center from public.spark_members where spark_members.id=p_member_id and active=true;
 if v_center is null or not public.spark_is_staff(v_center) then raise exception 'FORBIDDEN'; end if;
 return query select m.id,m.title,m.description,m.flame_code,m.target_label,m.difficulty,m.participation_type,m.safety_guide,m.starts_at,m.ends_at,
 exists(select 1 from public.spark_mission_completions c where c.mission_id=m.id and c.member_id=p_member_id)
 from public.spark_missions m where m.status='published' and m.starts_at<=now() and (m.ends_at is null or m.ends_at>=now())
 order by m.starts_at desc limit 20;
end; $$;

create or replace function public.spark_confirm_mission(p_member_id uuid,p_mission_id uuid)
returns boolean language plpgsql security definer set search_path='public'
as $$
declare v_center uuid;
begin
 select center_id into v_center from public.spark_members where id=p_member_id and active=true;
 if v_center is null or not public.spark_is_staff(v_center) then raise exception 'FORBIDDEN'; end if;
 if not exists(select 1 from public.spark_missions where id=p_mission_id and status='published' and starts_at<=now() and (ends_at is null or ends_at>=now())) then raise exception 'MISSION_NOT_ACTIVE'; end if;
 insert into public.spark_mission_completions(mission_id,member_id) values(p_mission_id,p_member_id) on conflict do nothing;
 return true;
end; $$;

create or replace function public.spark_hq_missions()
returns setof public.spark_missions language plpgsql stable security definer set search_path='public'
as $$
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 return query select * from public.spark_missions order by created_at desc;
end; $$;

create or replace function public.spark_hq_save_mission(p_id uuid,p_title text,p_description text,p_flame_code text,p_target_label text,p_difficulty text,p_participation_type text,p_safety_guide text,p_starts_at timestamptz,p_ends_at timestamptz)
returns uuid language plpgsql security definer set search_path='public'
as $$
declare v_id uuid;
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 if p_id is null then
  insert into public.spark_missions(title,description,flame_code,target_label,difficulty,participation_type,safety_guide,starts_at,ends_at)
  values(trim(p_title),trim(p_description),p_flame_code,coalesce(nullif(trim(p_target_label),''),'모두'),p_difficulty,p_participation_type,nullif(trim(p_safety_guide),''),coalesce(p_starts_at,now()),p_ends_at)
  returning id into v_id;
 else
  update public.spark_missions set title=trim(p_title),description=trim(p_description),flame_code=p_flame_code,target_label=coalesce(nullif(trim(p_target_label),''),'모두'),difficulty=p_difficulty,participation_type=p_participation_type,safety_guide=nullif(trim(p_safety_guide),''),starts_at=coalesce(p_starts_at,starts_at),ends_at=p_ends_at,updated_at=now() where id=p_id returning id into v_id;
 end if;
 return v_id;
end; $$;

create or replace function public.spark_hq_set_mission_status(p_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path='public'
as $$
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 if p_status not in ('draft','published','ended') then raise exception 'INVALID_STATUS'; end if;
 update public.spark_missions set status=p_status,updated_at=now() where id=p_id;
 return found;
end; $$;
