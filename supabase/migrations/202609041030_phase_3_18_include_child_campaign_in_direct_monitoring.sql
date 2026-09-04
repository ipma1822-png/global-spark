-- GLOBAL SPARK · PHASE 3-18
-- Count child-direct campaign actions together with normal child self records.

create or replace function public.spark_center_self_activity_monitor(p_center_code text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_center public.spark_centers%rowtype; v_summary jsonb; v_recent jsonb; v_members jsonb;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_center from public.spark_centers where center_code=p_center_code and status in ('pilot','active');
 if not found then raise exception 'CENTER_NOT_FOUND'; end if;
 if not public.spark_is_staff(v_center.id) then raise exception 'CENTER_FORBIDDEN'; end if;
 select jsonb_build_object(
  'active_members',(select count(*) from public.spark_members m where m.center_id=v_center.id and m.active=true),
  'active_kid_links',(select count(*) from public.spark_kid_links k join public.spark_members m on m.id=k.member_id where m.center_id=v_center.id and m.active=true and k.active=true),
  'links_used_7d',(select count(*) from public.spark_kid_links k join public.spark_members m on m.id=k.member_id where m.center_id=v_center.id and m.active=true and k.active=true and k.last_used_at>=now()-interval '7 days'),
  'self_today',(select count(*) from public.spark_activities a where a.center_id=v_center.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=date_trunc('day',now())),
  'self_7d',(select count(*) from public.spark_activities a where a.center_id=v_center.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=now()-interval '7 days'),
  'self_members_7d',(select count(distinct a.member_id) from public.spark_activities a where a.center_id=v_center.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=now()-interval '7 days')) into v_summary;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_recent from (
  select a.id,a.member_id,m.display_name,a.activity_type,r.label_ko,r.flame_code,r.xp,a.memo,a.created_at,a.source_system
  from public.spark_activities a
  join public.spark_members m on m.id=a.member_id
  join public.spark_activity_rules r on r.activity_type=a.activity_type
  where a.center_id=v_center.id and a.source_system in ('spark_kid_self','spark_campaign_kid')
  order by a.created_at desc limit 30) x;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.display_name),'[]'::jsonb) into v_members from (
  select m.id,m.display_name,m.member_code,coalesce(k.active,false) link_active,k.created_at link_created_at,k.last_used_at,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=date_trunc('day',now()))::int self_today,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=now()-interval '7 days')::int self_7d
  from public.spark_members m
  left join lateral (select kl.active,kl.created_at,kl.last_used_at from public.spark_kid_links kl where kl.member_id=m.id order by kl.active desc,kl.created_at desc limit 1) k on true
  where m.center_id=v_center.id and m.active=true) x;
 return jsonb_build_object('summary',v_summary,'recent',v_recent,'members',v_members);
end $function$;

create or replace function public.spark_hq_operational_signals()
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare v jsonb;
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 select jsonb_build_object(
  'centers_no_activity_7d',(select count(*) from spark_centers c where c.status in ('active','pilot') and not exists(select 1 from spark_activities a where a.center_id=c.id and a.created_at>=now()-interval '7 days')),
  'members_no_activity_7d',(select count(*) from spark_members m where m.active=true and not exists(select 1 from spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days')),
  'self_activity_today',(select count(*) from spark_activities a where a.created_at>=date_trunc('day',now()) and a.source_system in ('spark_kid_self','spark_campaign_kid')),
  'campaign_actions_7d',(select count(*) from spark_campaign_actions a where a.created_at>=now()-interval '7 days'),
  'new_center_requests',(select count(*) from spark_center_interest where status='new'),
  'active_campaigns',(select count(*) from spark_campaigns where status='published' and starts_at<=now() and(ends_at is null or ends_at>=now()))
 ) into v;
 return v;
end $function$;

-- spark_center_growth_dashboard was updated in production in the same change to use
-- source_system in ('spark_kid_self','spark_campaign_kid') for self_today/self_7d.
