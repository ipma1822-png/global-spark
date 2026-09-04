create or replace function public.spark_get_public_live_v370()
returns jsonb
language plpgsql
stable
security definer
set search_path='public'
as $$
declare
  v_today bigint:=0; v_week bigint:=0; v_centers bigint:=0; v_total bigint:=0;
  v_center_rows jsonb; v_flames jsonb; v_events jsonb; v_countries jsonb;
begin
  select count(*) into v_centers from spark_centers where status in ('pilot','active');
  select count(*) into v_today from spark_activities a where a.created_at>=date_trunc('day',now()) and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
  select count(*) into v_week from spark_activities a where a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
  select coalesce(sum(amount),0) into v_total from spark_ledger;

  select coalesce(jsonb_agg(jsonb_build_object('center_name',name,'country_code',country_code,'region_name',region_name,'today_count',today_count,'week_count',week_count,'total_xp',total_xp) order by today_count desc,week_count desc),'[]'::jsonb)
  into v_center_rows from (
    select c.id,c.name,c.country_code,coalesce(c.region_name,'') region_name,
      (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=date_trunc('day',now()) and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) today_count,
      (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) week_count,
      (select coalesce(sum(l.amount),0) from spark_ledger l where l.center_id=c.id) total_xp
    from spark_centers c where c.status in ('pilot','active') order by today_count desc,week_count desc limit 20
  ) q;

  with codes(code) as (values ('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN'))
  select jsonb_object_agg(code,cnt) into v_flames from (
    select codes.code,coalesce(x.cnt,0) cnt from codes left join (
      select coalesce(a.flame_code,r.flame_code,'GOOD') code,count(*) cnt
      from spark_activities a left join spark_activity_rules r on r.activity_type=a.activity_type
      where a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)
      group by coalesce(a.flame_code,r.flame_code,'GOOD')
    ) x on x.code=codes.code
  ) z;

  select coalesce(jsonb_agg(jsonb_build_object('center_name',c.name,'country_code',c.country_code,'region_name',coalesce(c.region_name,''),'label_ko',coalesce(r.label_ko,a.activity_type),'flame_code',coalesce(a.flame_code,r.flame_code,'GOOD'),'created_at',a.created_at) order by a.created_at desc),'[]'::jsonb)
  into v_events
  from (select * from spark_activities order by created_at desc limit 40) a
  join spark_centers c on c.id=a.center_id and c.status in ('pilot','active')
  left join spark_activity_rules r on r.activity_type=a.activity_type
  where exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);

  select coalesce(jsonb_agg(jsonb_build_object('country_code',country_code,'centers',centers,'week_count',week_count) order by week_count desc),'[]'::jsonb)
  into v_countries from (
    select coalesce(c.country_code,'--') country_code,count(*) centers,
      (select count(*) from spark_activities a join spark_centers c2 on c2.id=a.center_id where c2.status in ('pilot','active') and coalesce(c2.country_code,'--')=coalesce(c.country_code,'--') and a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) week_count
    from spark_centers c where c.status in ('pilot','active') group by c.country_code
  ) q;

  return jsonb_build_object('ok',true,'today_count',v_today,'week_count',v_week,'active_centers',v_centers,'total_xp',v_total,'centers',v_center_rows,'flames_7d',v_flames,'live_events',v_events,'countries',v_countries);
end $$;
revoke all on function public.spark_get_public_live_v370() from public;
grant execute on function public.spark_get_public_live_v370() to anon,authenticated;