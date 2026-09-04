create or replace function public.spark_center_growth_dashboard(p_center_code text)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $$
declare
  v_center_id uuid;
  v_summary jsonb;
  v_members jsonb;
begin
  select id into v_center_id from public.spark_centers
  where center_code=p_center_code and status in ('pilot','active');
  if v_center_id is null then raise exception 'CENTER_NOT_FOUND'; end if;
  if not public.spark_is_staff(v_center_id) then raise exception 'CENTER_FORBIDDEN'; end if;

  select jsonb_build_object(
    'active_members', count(*),
    'active_today', count(*) filter (where last_activity >= date_trunc('day',now())),
    'active_7d', count(*) filter (where last_activity >= now()-interval '7 days'),
    'inactive_7d', count(*) filter (where last_activity is null or last_activity < now()-interval '7 days'),
    'xp_7d', coalesce(sum(xp_7d),0)
  ), jsonb_agg(jsonb_build_object(
    'id',id,'display_name',display_name,'member_code',member_code,
    'total_xp',total_xp,'xp_7d',xp_7d,'activity_7d',activity_7d,
    'last_activity',last_activity,'dominant_flame',dominant_flame,
    'repeat_7d',repeat_7d,'needs_attention',(last_activity is null or last_activity < now()-interval '7 days' or repeat_7d>=5)
  ) order by display_name)
  into v_summary,v_members
  from (
    select m.id,m.display_name,m.member_code,
      coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id),0) total_xp,
      coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id and l.created_at>=now()-interval '7 days'),0) xp_7d,
      (select count(*) from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) activity_7d,
      (select max(a.created_at) from public.spark_activities a where a.member_id=m.id and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) last_activity,
      (select a.flame_code from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and a.flame_code is not null and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by a.flame_code order by count(*) desc,a.flame_code limit 1) dominant_flame,
      coalesce((select max(c) from (select count(*) c from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by a.activity_type) q),0) repeat_7d
    from public.spark_members m where m.center_id=v_center_id and m.active=true
  ) s;

  return jsonb_build_object('ok',true,'summary',coalesce(v_summary,'{}'::jsonb),'members',coalesce(v_members,'[]'::jsonb));
end;
$$;
grant execute on function public.spark_center_growth_dashboard(text) to authenticated;