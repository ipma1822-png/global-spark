-- GLOBAL SPARK PHASE 3-9.2
-- Fix PL/pgSQL output-column ambiguity in member campaign RPCs.

create or replace function public.spark_member_campaigns(p_member_id uuid)
returns table(id uuid, title text, description text, flame_code text, starts_at timestamptz, ends_at timestamptz, joined boolean)
language plpgsql
stable
security definer
set search_path='public'
as $function$
declare v_center uuid;
begin
  select sm.center_id into v_center
  from public.spark_members sm
  where sm.id=p_member_id and sm.active=true;

  if v_center is null or not public.spark_is_staff(v_center) then
    raise exception 'FORBIDDEN';
  end if;

  return query
  select sc.id,sc.title,sc.description,sc.flame_code,sc.starts_at,sc.ends_at,
         exists(
           select 1
           from public.spark_campaign_participations sp
           where sp.campaign_id=sc.id and sp.member_id=p_member_id
         )
  from public.spark_campaigns sc
  where sc.status='published'
    and sc.starts_at<=now()
    and (sc.ends_at is null or sc.ends_at>=now())
  order by sc.starts_at desc;
end
$function$;

create or replace function public.spark_join_campaign(p_campaign_id uuid, p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
declare v_center uuid;
begin
  select sm.center_id into v_center
  from public.spark_members sm
  where sm.id=p_member_id and sm.active=true;

  if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
  if not public.spark_is_staff(v_center) then raise exception 'FORBIDDEN'; end if;

  if not exists(
    select 1
    from public.spark_campaigns sc
    where sc.id=p_campaign_id
      and sc.status='published'
      and sc.starts_at<=now()
      and (sc.ends_at is null or sc.ends_at>=now())
  ) then
    raise exception 'CAMPAIGN_NOT_ACTIVE';
  end if;

  insert into public.spark_campaign_participations(campaign_id,member_id,center_id)
  values(p_campaign_id,p_member_id,v_center)
  on conflict(campaign_id,member_id) do nothing;

  return jsonb_build_object('ok',true);
end
$function$;

grant execute on function public.spark_member_campaigns(uuid) to authenticated;
grant execute on function public.spark_join_campaign(uuid,uuid) to authenticated;
