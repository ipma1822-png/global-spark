-- GLOBAL SPARK · PHASE 3-15 · HQ operational signals
create or replace function public.spark_hq_operational_signals()
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v jsonb;
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 select jsonb_build_object(
  'centers_no_activity_7d',(select count(*) from spark_centers c where c.status in ('active','pilot') and not exists(select 1 from spark_activities a where a.center_id=c.id and a.created_at>=now()-interval '7 days')),
  'members_no_activity_7d',(select count(*) from spark_members m where m.active=true and not exists(select 1 from spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days')),
  'self_activity_today',(select count(*) from spark_activities a where a.created_at>=date_trunc('day',now()) and a.source_system='spark_kid'),
  'campaign_actions_7d',(select count(*) from spark_campaign_actions a where a.created_at>=now()-interval '7 days'),
  'new_center_requests',(select count(*) from spark_center_interest where status='new'),
  'active_campaigns',(select count(*) from spark_campaigns where status='published' and starts_at<=now() and(ends_at is null or ends_at>=now()))
 ) into v;
 return v;
end $function$;
grant execute on function public.spark_hq_operational_signals() to authenticated;
