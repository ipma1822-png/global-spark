-- GLOBAL SPARK PHASE 3-10 · campaign participation -> real action -> flame/XP

alter table public.spark_campaigns
  add column if not exists action_activity_type text
  references public.spark_activity_rules(activity_type);

-- Existing first environment campaign: align its flame and action rule with its purpose.
update public.spark_campaigns
set flame_code='EARTH', action_activity_type='environment_care', updated_at=now()
where title='세계환경불꽃주간' and status='published';

create table if not exists public.spark_campaign_actions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.spark_campaigns(id) on delete cascade,
  member_id uuid not null references public.spark_members(id) on delete cascade,
  center_id uuid not null references public.spark_centers(id) on delete cascade,
  activity_id uuid not null unique references public.spark_activities(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.spark_campaign_actions enable row level security;

create or replace function public.spark_hq_save_campaign(
  p_id uuid, p_title text, p_description text, p_flame_code text,
  p_starts_at timestamptz, p_ends_at timestamptz
) returns uuid
language plpgsql security definer set search_path='public'
as $$
declare v_id uuid; v_action text;
begin
  if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
  if p_ends_at is not null and p_starts_at is not null and p_ends_at < p_starts_at then raise exception 'INVALID_PERIOD'; end if;
  v_action := case p_flame_code
    when 'EARTH' then 'environment_care'
    when 'SAFE' then 'courage'
    when 'CHALLENGE' then 'exercise_challenge'
    when 'CITIZEN' then 'service_share'
    else 'other_good_action' end;
  if p_id is null then
    insert into public.spark_campaigns(title,description,flame_code,action_activity_type,starts_at,ends_at,created_by)
    values(p_title,coalesce(p_description,''),p_flame_code,v_action,coalesce(p_starts_at,now()),p_ends_at,auth.uid()) returning id into v_id;
  else
    update public.spark_campaigns set title=p_title,description=coalesce(p_description,''),flame_code=p_flame_code,
      action_activity_type=v_action,starts_at=coalesce(p_starts_at,starts_at),ends_at=p_ends_at,updated_at=now()
    where id=p_id returning id into v_id;
  end if;
  return v_id;
end $$;
grant execute on function public.spark_hq_save_campaign(uuid,text,text,text,timestamptz,timestamptz) to authenticated;

drop function if exists public.spark_member_campaigns(uuid);
create function public.spark_member_campaigns(p_member_id uuid)
returns table(id uuid,title text,description text,flame_code text,starts_at timestamptz,ends_at timestamptz,joined boolean,action_count bigint,action_activity_type text)
language plpgsql stable security definer set search_path='public'
as $$
declare v_center uuid;
begin
  select sm.center_id into v_center from public.spark_members sm where sm.id=p_member_id and sm.active=true;
  if v_center is null or not public.spark_is_staff(v_center) then raise exception 'FORBIDDEN'; end if;
  return query
  select sc.id,sc.title,sc.description,sc.flame_code,sc.starts_at,sc.ends_at,
    exists(select 1 from public.spark_campaign_participations cp where cp.campaign_id=sc.id and cp.member_id=p_member_id),
    (select count(*) from public.spark_campaign_actions ca where ca.campaign_id=sc.id and ca.member_id=p_member_id),
    sc.action_activity_type
  from public.spark_campaigns sc
  where sc.status='published' and sc.starts_at<=now() and (sc.ends_at is null or sc.ends_at>=now())
  order by sc.starts_at desc;
end $$;
grant execute on function public.spark_member_campaigns(uuid) to authenticated;

create or replace function public.spark_complete_campaign_action(p_campaign_id uuid,p_member_id uuid,p_memo text default '')
returns jsonb
language plpgsql security definer set search_path='public'
as $$
declare v_center uuid; v_type text; v_xp integer; v_activity uuid; v_total bigint;
begin
  select sm.center_id into v_center
  from public.spark_members sm join public.spark_centers sc on sc.id=sm.center_id
  where sm.id=p_member_id and sm.active=true and sc.status in ('pilot','active');
  if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
  if not public.spark_is_staff(v_center) then raise exception 'FORBIDDEN'; end if;
  select c.action_activity_type into v_type from public.spark_campaigns c
  where c.id=p_campaign_id and c.status='published' and c.starts_at<=now() and (c.ends_at is null or c.ends_at>=now());
  if v_type is null then raise exception 'CAMPAIGN_ACTION_NOT_CONFIGURED'; end if;
  select r.xp into v_xp from public.spark_activity_rules r where r.activity_type=v_type and r.active=true;
  if v_xp is null then raise exception 'RULE_NOT_FOUND'; end if;
  insert into public.spark_campaign_participations(campaign_id,member_id,center_id,source)
  values(p_campaign_id,p_member_id,v_center,'campaign_action') on conflict(campaign_id,member_id) do nothing;
  insert into public.spark_activities(center_id,member_id,activity_type,memo,verified_by,source_system)
  values(v_center,p_member_id,v_type,nullif(left(trim(coalesce(p_memo,'')),200),''),auth.uid(),'spark_campaign') returning id into v_activity;
  insert into public.spark_ledger(center_id,member_id,activity_id,amount,reason,created_by)
  values(v_center,p_member_id,v_activity,v_xp,'campaign:'||p_campaign_id::text||':'||v_type,auth.uid());
  insert into public.spark_campaign_actions(campaign_id,member_id,center_id,activity_id)
  values(p_campaign_id,p_member_id,v_center,v_activity);
  select coalesce(sum(sl.amount),0) into v_total from public.spark_ledger sl where sl.member_id=p_member_id;
  return jsonb_build_object('ok',true,'activity_id',v_activity,'xp',v_xp,'total_xp',v_total,'activity_type',v_type);
end $$;
grant execute on function public.spark_complete_campaign_action(uuid,uuid,text) to authenticated;

drop function if exists public.spark_hq_campaign_stats();
create function public.spark_hq_campaign_stats()
returns table(campaign_id uuid,title text,flame_code text,countries bigint,centers bigint,members bigint,actions bigint)
language plpgsql stable security definer set search_path='public'
as $$ begin
  if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
  return query select c.id,c.title,c.flame_code,count(distinct ce.country_code),count(distinct cp.center_id),count(distinct cp.member_id),count(ca.id)
  from public.spark_campaigns c
  left join public.spark_campaign_participations cp on cp.campaign_id=c.id
  left join public.spark_centers ce on ce.id=cp.center_id
  left join public.spark_campaign_actions ca on ca.campaign_id=c.id
  group by c.id,c.title,c.flame_code order by c.created_at desc;
end $$;
grant execute on function public.spark_hq_campaign_stats() to authenticated;

drop function if exists public.spark_public_campaign_stats();
create function public.spark_public_campaign_stats()
returns table(campaign_id uuid,title text,flame_code text,countries bigint,centers bigint,participants bigint,actions bigint)
language sql stable security definer set search_path='public'
as $$
 select c.id,c.title,c.flame_code,count(distinct ce.country_code),count(distinct cp.center_id),count(distinct cp.member_id),count(ca.id)
 from public.spark_campaigns c
 left join public.spark_campaign_participations cp on cp.campaign_id=c.id
 left join public.spark_centers ce on ce.id=cp.center_id
 left join public.spark_campaign_actions ca on ca.campaign_id=c.id
 where c.status='published' and c.starts_at<=now() and(c.ends_at is null or c.ends_at>=now())
 group by c.id,c.title,c.flame_code order by c.starts_at desc;
$$;
grant execute on function public.spark_public_campaign_stats() to anon,authenticated;
