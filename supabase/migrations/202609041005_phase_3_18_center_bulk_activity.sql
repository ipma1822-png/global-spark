-- GLOBAL SPARK PHASE 3-18 · center bulk activity registration
create or replace function public.spark_center_bulk_register_activity(
  p_center_code text,
  p_member_ids uuid[],
  p_activity_type text,
  p_memo text default ''
)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
declare
  v_center uuid;
  v_xp integer;
  v_ids uuid[];
  v_id uuid;
  v_activity uuid;
  v_count integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select id into v_center from public.spark_centers where center_code=p_center_code and status in ('pilot','active');
  if v_center is null then raise exception 'CENTER_NOT_FOUND'; end if;
  if not public.spark_is_staff(v_center) then raise exception 'CENTER_FORBIDDEN'; end if;
  select array_agg(distinct x) into v_ids from unnest(coalesce(p_member_ids,'{}'::uuid[])) x;
  v_count:=coalesce(array_length(v_ids,1),0);
  if v_count<1 then raise exception 'NO_MEMBERS_SELECTED'; end if;
  if v_count>100 then raise exception 'TOO_MANY_MEMBERS'; end if;
  if exists(select 1 from unnest(v_ids) x left join public.spark_members m on m.id=x and m.center_id=v_center and m.active=true where m.id is null) then raise exception 'BATCH_MEMBER_INVALID'; end if;
  select xp into v_xp from public.spark_activity_rules where activity_type=p_activity_type and active=true;
  if v_xp is null then raise exception 'RULE_NOT_FOUND'; end if;
  foreach v_id in array v_ids loop
    insert into public.spark_activities(center_id,member_id,activity_type,memo,verified_by,source_system)
    values(v_center,v_id,p_activity_type,nullif(left(trim(coalesce(p_memo,'')),200),''),auth.uid(),'spark_center_bulk') returning id into v_activity;
    insert into public.spark_ledger(center_id,member_id,activity_id,amount,reason,created_by)
    values(v_center,v_id,v_activity,v_xp,'bulk_activity:'||p_activity_type,auth.uid());
  end loop;
  return jsonb_build_object('ok',true,'member_count',v_count,'xp_each',v_xp,'total_awarded',v_count*v_xp,'member_ids',to_jsonb(v_ids));
end $function$;
revoke all on function public.spark_center_bulk_register_activity(text,uuid[],text,text) from public;
grant execute on function public.spark_center_bulk_register_activity(text,uuid[],text,text) to authenticated;