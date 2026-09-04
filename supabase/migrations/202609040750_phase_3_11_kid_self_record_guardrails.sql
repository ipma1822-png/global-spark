-- GLOBAL SPARK · PHASE 3-11
-- Kid self-recording keeps the existing XP/ledger engine and adds only lightweight abuse guardrails.
create or replace function public.spark_kid_register_activity(p_token text, p_activity_type text, p_memo text default '')
returns jsonb
language plpgsql
security definer
set search_path=''
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
  from public.spark_kid_links k join public.spark_members m on m.id=k.member_id
  where k.active=true and k.token_hash=extensions.digest(p_token,'sha256') and m.active=true limit 1;
  if not found then raise exception 'INVALID_LINK'; end if;

  select xp into v_xp from public.spark_activity_rules where activity_type=p_activity_type and active=true;
  if v_xp is null then raise exception 'RULE_NOT_FOUND'; end if;

  select count(*) into v_today_count
  from public.spark_activities a
  where a.member_id=v_member.id and a.source_system='spark_kid_self' and a.created_at>=date_trunc('day',now());
  if v_today_count>=5 then raise exception 'DAILY_SELF_LIMIT'; end if;

  select exists(
    select 1 from public.spark_activities a
    where a.member_id=v_member.id and a.source_system='spark_kid_self'
      and a.activity_type=p_activity_type and a.created_at>=now()-interval '2 minutes'
  ) into v_same_recent;
  if v_same_recent then raise exception 'TOO_FAST_REPEAT'; end if;

  select created_by into v_creator from public.spark_kid_links where member_id=v_member.id;
  insert into public.spark_activities(center_id,member_id,activity_type,memo,verified_by,source_system)
  values(v_member.center_id,v_member.id,p_activity_type,nullif(left(trim(coalesce(p_memo,'')),200),''),v_creator,'spark_kid_self')
  returning id into v_activity;
  insert into public.spark_ledger(center_id,member_id,activity_id,amount,reason,created_by)
  values(v_member.center_id,v_member.id,v_activity,v_xp,'kid_self:'||p_activity_type,v_creator);
  update public.spark_kid_links set last_used_at=now() where member_id=v_member.id;
  select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
  return jsonb_build_object('ok',true,'activity_id',v_activity,'xp',v_xp,'total_xp',v_total,'level',floor(v_total/100.0)::int+1,'self_today',v_today_count+1,'self_daily_limit',5);
end
$function$;
grant execute on function public.spark_kid_register_activity(text,text,text) to anon, authenticated;
