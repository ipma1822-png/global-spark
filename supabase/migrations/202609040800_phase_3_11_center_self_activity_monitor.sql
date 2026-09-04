-- GLOBAL SPARK · PHASE 3-11
-- Staff-only operational view for kid self-recording and personal-link adoption.
create or replace function public.spark_center_self_activity_monitor(p_center_code text)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
declare
  v_center public.spark_centers%rowtype;
  v_summary jsonb;
  v_recent jsonb;
  v_members jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_center from public.spark_centers where center_code=p_center_code and status in ('pilot','active');
  if not found then raise exception 'CENTER_NOT_FOUND'; end if;
  if not public.spark_is_staff(v_center.id) then raise exception 'CENTER_FORBIDDEN'; end if;

  select jsonb_build_object(
    'active_members',(select count(*) from public.spark_members m where m.center_id=v_center.id and m.active=true),
    'active_kid_links',(select count(*) from public.spark_kid_links k join public.spark_members m on m.id=k.member_id where m.center_id=v_center.id and m.active=true and k.active=true),
    'links_used_7d',(select count(*) from public.spark_kid_links k join public.spark_members m on m.id=k.member_id where m.center_id=v_center.id and m.active=true and k.active=true and k.last_used_at>=now()-interval '7 days'),
    'self_today',(select count(*) from public.spark_activities a where a.center_id=v_center.id and a.source_system='spark_kid_self' and a.created_at>=date_trunc('day',now())),
    'self_7d',(select count(*) from public.spark_activities a where a.center_id=v_center.id and a.source_system='spark_kid_self' and a.created_at>=now()-interval '7 days'),
    'self_members_7d',(select count(distinct a.member_id) from public.spark_activities a where a.center_id=v_center.id and a.source_system='spark_kid_self' and a.created_at>=now()-interval '7 days')
  ) into v_summary;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_recent
  from (
    select a.id,a.member_id,m.display_name,a.activity_type,r.label_ko,r.flame_code,r.xp,a.memo,a.created_at
    from public.spark_activities a
    join public.spark_members m on m.id=a.member_id
    join public.spark_activity_rules r on r.activity_type=a.activity_type
    where a.center_id=v_center.id and a.source_system='spark_kid_self'
    order by a.created_at desc limit 30
  ) x;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.display_name),'[]'::jsonb) into v_members
  from (
    select m.id,m.display_name,m.member_code,
      coalesce(k.active,false) as link_active,k.created_at as link_created_at,k.last_used_at,
      (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system='spark_kid_self' and a.created_at>=date_trunc('day',now()))::int as self_today,
      (select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system='spark_kid_self' and a.created_at>=now()-interval '7 days')::int as self_7d
    from public.spark_members m
    left join public.spark_kid_links k on k.member_id=m.id
    where m.center_id=v_center.id and m.active=true
  ) x;

  return jsonb_build_object('summary',v_summary,'recent',v_recent,'members',v_members);
end
$function$;
grant execute on function public.spark_center_self_activity_monitor(text) to authenticated;
