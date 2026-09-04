-- GLOBAL SPARK · SPARK WORLD PHASE 10 · v2.22.0
-- Integration guardrails for loginless kid room.

create or replace function public.spark_kid_room(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_member public.spark_members%rowtype;
  v_link_id uuid;
  v_member_id uuid;
  v_total bigint;
  v_level int;
  v_recent jsonb;
  v_rules jsonb;
  v_badges jsonb;
  v_flames jsonb;
  v_center jsonb;
begin
  if p_token is null or length(p_token) < 32 then raise exception 'INVALID_LINK'; end if;
  select k.id,m.id into v_link_id,v_member_id
  from public.spark_kid_links k
  join public.spark_members m on m.id=k.member_id
  join public.spark_centers c on c.id=m.center_id
  where k.active=true
    and k.token_hash=extensions.digest(p_token,'sha256')
    and m.active=true
    and c.status in ('pilot','active')
  order by k.created_at desc limit 1;
  if not found then raise exception 'INVALID_LINK'; end if;

  select * into v_member from public.spark_members where id=v_member_id;
  update public.spark_kid_links set last_used_at=now() where id=v_link_id;
  select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
  v_level:=floor(v_total/100.0)::int+1;

  select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb) into v_recent
  from (
    select a.id as activity_id,a.activity_type,r.label_ko,r.flame_code,
           coalesce(sum(l.amount),0)::bigint as net_xp,a.created_at
    from public.spark_activities a
    join public.spark_activity_rules r on r.activity_type=a.activity_type
    left join public.spark_ledger l on l.activity_id=a.id
    where a.member_id=v_member.id
    group by a.id,a.activity_type,r.label_ko,r.flame_code,a.created_at
    order by a.created_at desc limit 20
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object('activity_type',activity_type,'label_ko',label_ko,'xp',xp,'flame_code',flame_code) order by label_ko),'[]'::jsonb) into v_rules
  from public.spark_activity_rules where active=true;

  with codes(code,ord) as (values ('GOOD',1),('SAFE',2),('EARTH',3),('CHALLENGE',4),('CITIZEN',5)),
  counts as (
    select c.code,c.ord,coalesce(x.cnt,0) cnt
    from codes c
    left join (
      select coalesce(r.flame_code,'GOOD') code,count(*) cnt
      from public.spark_activities a
      left join public.spark_activity_rules r on r.activity_type=a.activity_type
      where a.member_id=v_member.id
        and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)
      group by coalesce(r.flame_code,'GOOD')
    ) x on x.code=c.code
  )
  select jsonb_object_agg(code,cnt order by ord) into v_flames from counts;

  select coalesce(jsonb_agg(jsonb_build_object('badge_code',badge_code,'awarded_at',awarded_at,'source',source) order by awarded_at desc),'[]'::jsonb) into v_badges
  from public.spark_badge_awards where member_id=v_member.id;

  select jsonb_build_object('center_code',c.center_code,'name',c.name,'country_code',c.country_code,'region_name',c.region_name) into v_center
  from public.spark_centers c where c.id=v_member.center_id;

  return jsonb_build_object(
    'member',jsonb_build_object('id',v_member.id,'display_name',v_member.display_name,'photo_url',v_member.photo_url),
    'center',v_center,
    'total_xp',v_total,'level',v_level,'next_level_xp',v_level*100,
    'flames',coalesce(v_flames,'{}'::jsonb),'badges',coalesce(v_badges,'[]'::jsonb),
    'recent',v_recent,'rules',v_rules
  );
end
$function$;

create or replace function public.spark_kid_register_activity(p_token text, p_activity_type text, p_memo text default ''::text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_member public.spark_members%rowtype;
  v_xp int;
  v_activity uuid;
  v_total bigint;
  v_creator uuid;
  v_today_count int;
  v_same_recent boolean;
begin
  if p_token is null or length(p_token)<32 then raise exception 'INVALID_LINK'; end if;
  select m.* into v_member
  from public.spark_kid_links k
  join public.spark_members m on m.id=k.member_id
  join public.spark_centers c on c.id=m.center_id
  where k.active=true
    and k.token_hash=extensions.digest(p_token,'sha256')
    and m.active=true
    and c.status in ('pilot','active')
  order by k.created_at desc limit 1;
  if not found then raise exception 'INVALID_LINK'; end if;

  select k.created_by into v_creator from public.spark_kid_links k
  where k.active=true and k.token_hash=extensions.digest(p_token,'sha256') and k.member_id=v_member.id
  order by k.created_at desc limit 1;

  select xp into v_xp from public.spark_activity_rules where activity_type=p_activity_type and active=true;
  if v_xp is null then raise exception 'RULE_NOT_FOUND'; end if;

  select count(*) into v_today_count from public.spark_activities a
  where a.member_id=v_member.id
    and a.source_system in ('spark_kid_self','spark_campaign_kid')
    and a.created_at>=date_trunc('day',now());
  if v_today_count>=5 then raise exception 'DAILY_SELF_LIMIT'; end if;

  select exists(select 1 from public.spark_activities a
    where a.member_id=v_member.id
      and a.source_system in ('spark_kid_self','spark_campaign_kid')
      and a.activity_type=p_activity_type
      and a.created_at>=now()-interval '2 minutes') into v_same_recent;
  if v_same_recent then raise exception 'TOO_FAST_REPEAT'; end if;

  insert into public.spark_activities(center_id,member_id,activity_type,memo,verified_by,source_system)
  values(v_member.center_id,v_member.id,p_activity_type,nullif(left(trim(coalesce(p_memo,'')),200),''),v_creator,'spark_kid_self') returning id into v_activity;
  insert into public.spark_ledger(center_id,member_id,activity_id,amount,reason,created_by)
  values(v_member.center_id,v_member.id,v_activity,v_xp,'kid_self:'||p_activity_type,v_creator);
  update public.spark_kid_links set last_used_at=now() where active=true and token_hash=extensions.digest(p_token,'sha256');
  select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
  return jsonb_build_object('ok',true,'activity_id',v_activity,'xp',v_xp,'total_xp',v_total,'level',floor(v_total/100.0)::int+1,'self_today',v_today_count+1,'self_daily_limit',5);
end
$function$;
