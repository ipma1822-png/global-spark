-- GLOBAL SPARK · PHASE 3-18
-- Count child-direct campaign actions together with normal child self records.

create or replace function public.spark_center_self_activity_monitor(p_center_code text)
returns jsonb language plpgsql security definer set search_path to 'public'
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
  from public.spark_activities a join public.spark_members m on m.id=a.member_id join public.spark_activity_rules r on r.activity_type=a.activity_type
  where a.center_id=v_center.id and a.source_system in ('spark_kid_self','spark_campaign_kid') order by a.created_at desc limit 30) x;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.display_name),'[]'::jsonb) into v_members from (
  select m.id,m.display_name,m.member_code,coalesce(k.active,false) link_active,k.created_at link_created_at,k.last_used_at,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=date_trunc('day',now()))::int self_today,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=now()-interval '7 days')::int self_7d
  from public.spark_members m left join lateral (select kl.active,kl.created_at,kl.last_used_at from public.spark_kid_links kl where kl.member_id=m.id order by kl.active desc,kl.created_at desc limit 1) k on true
  where m.center_id=v_center.id and m.active=true) x;
 return jsonb_build_object('summary',v_summary,'recent',v_recent,'members',v_members);
end $function$;

create or replace function public.spark_center_growth_dashboard(p_center_code text)
returns jsonb language plpgsql stable security definer set search_path to 'public'
as $function$
declare v_center_id uuid; v_summary jsonb; v_members jsonb;
begin
 select id into v_center_id from public.spark_centers where center_code=p_center_code and status in ('pilot','active');
 if v_center_id is null then raise exception 'CENTER_NOT_FOUND'; end if;
 if not public.spark_is_staff(v_center_id) then raise exception 'CENTER_FORBIDDEN'; end if;
 with member_stats as (
  select m.id,m.display_name,m.member_code,
   coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id),0)::bigint total_xp,
   coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id and l.created_at>=now()-interval '7 days'),0)::bigint xp_7d,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0))::int activity_7d,
   (select max(a.created_at) from public.spark_activities a where a.member_id=m.id and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) last_activity,
   (select r.flame_code from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by r.flame_code order by count(*) desc,r.flame_code limit 1) dominant_flame,
   coalesce((select max(c) from (select count(*) c from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by a.activity_type) q),0)::int repeat_7d,
   coalesce((select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=date_trunc('day',now())),0)::int self_today,
   coalesce((select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=now()-interval '7 days'),0)::int self_7d,
   exists(select 1 from public.spark_kid_links k where k.member_id=m.id and k.active=true) link_active,
   (select max(k.last_used_at) from public.spark_kid_links k where k.member_id=m.id and k.active=true) link_last_used,
   exists(select 1 from public.spark_member_shares s where s.member_id=m.id and s.active=true and s.expires_at>now()) parent_share_active,
   coalesce((select count(*) from public.spark_campaign_actions ca where ca.member_id=m.id and ca.created_at>=now()-interval '7 days'),0)::int campaign_actions_7d
  from public.spark_members m where m.center_id=v_center_id and m.active=true
 )
 select jsonb_build_object(
  'active_members',count(*),'active_today',count(*) filter(where last_activity>=date_trunc('day',now())),'active_7d',count(*) filter(where last_activity>=now()-interval '7 days'),'inactive_7d',count(*) filter(where last_activity is null or last_activity<now()-interval '7 days'),'xp_7d',coalesce(sum(xp_7d),0),'self_today',coalesce(sum(self_today),0),'self_7d',coalesce(sum(self_7d),0),'self_members_7d',count(*) filter(where self_7d>0),'active_kid_links',count(*) filter(where link_active),'active_parent_shares',count(*) filter(where parent_share_active),'campaign_actions_7d',coalesce(sum(campaign_actions_7d),0),'attention_members',count(*) filter(where last_activity is null or last_activity<now()-interval '7 days' or self_today>=4)
 ),coalesce(jsonb_agg(jsonb_build_object('id',id,'display_name',display_name,'member_code',member_code,'total_xp',total_xp,'xp_7d',xp_7d,'activity_7d',activity_7d,'last_activity',last_activity,'dominant_flame',dominant_flame,'repeat_7d',repeat_7d,'self_today',self_today,'self_7d',self_7d,'link_active',link_active,'link_last_used',link_last_used,'parent_share_active',parent_share_active,'campaign_actions_7d',campaign_actions_7d,'needs_attention',(last_activity is null or last_activity<now()-interval '7 days' or self_today>=4),'attention_reason',case when self_today>=4 then '직접기록 많음' when last_activity is null or last_activity<now()-interval '7 days' then '7일 미활동' else null end) order by display_name),'[]'::jsonb)
 into v_summary,v_members from member_stats;
 return jsonb_build_object('ok',true,'summary',coalesce(v_summary,'{}'::jsonb),'members',coalesce(v_members,'[]'::jsonb));
end $function$;

create or replace function public.spark_hq_operational_signals()
returns jsonb language plpgsql stable security definer set search_path to 'public'
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
