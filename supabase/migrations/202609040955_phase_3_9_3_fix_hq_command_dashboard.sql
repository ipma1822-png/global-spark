-- GLOBAL SPARK PHASE 3-9.3
-- Fix HQ COMMAND CENTER dashboard flame aggregation and include pilot centers.

create or replace function public.spark_hq_command_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare v_summary jsonb; v_countries jsonb; v_centers jsonb; v_flames jsonb; v_missions jsonb; v_interests jsonb;
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;

 select jsonb_build_object(
   'countries',count(distinct country_code) filter(where status in ('active','pilot')),
   'active_centers',count(*) filter(where status in ('active','pilot')),
   'active_members',(select count(*) from spark_members where active=true),
   'today_activities',(select count(*) from spark_activities where created_at>=date_trunc('day',now())),
   'week_activities',(select count(*) from spark_activities where created_at>=now()-interval '7 days'),
   'total_xp',(select coalesce(sum(amount),0) from spark_ledger),
   'new_center_requests',(select count(*) from spark_center_interest where status='new'),
   'published_missions',(select count(*) from spark_missions where status='published')
 ) into v_summary from spark_centers;

 select coalesce(jsonb_agg(jsonb_build_object('country_code',country_code,'centers',centers,'members',members,'week_activities',week_activities,'total_xp',total_xp) order by week_activities desc),'[]'::jsonb)
 into v_countries
 from (
   select coalesce(c.country_code,'--') country_code,
          count(*) centers,
          (select count(*) from spark_members m join spark_centers c2 on c2.id=m.center_id where m.active=true and c2.status in ('active','pilot') and coalesce(c2.country_code,'--')=coalesce(c.country_code,'--')) members,
          (select count(*) from spark_activities a join spark_centers c2 on c2.id=a.center_id where c2.status in ('active','pilot') and a.created_at>=now()-interval '7 days' and coalesce(c2.country_code,'--')=coalesce(c.country_code,'--')) week_activities,
          (select coalesce(sum(l.amount),0) from spark_ledger l join spark_centers c2 on c2.id=l.center_id where c2.status in ('active','pilot') and coalesce(c2.country_code,'--')=coalesce(c.country_code,'--')) total_xp
   from spark_centers c where c.status in ('active','pilot') group by c.country_code
 ) q;

 select coalesce(jsonb_agg(jsonb_build_object('center_code',center_code,'name',name,'country_code',country_code,'region_name',region_name,'members',members,'week_activities',week_activities,'today_activities',today_activities,'total_xp',total_xp) order by week_activities desc),'[]'::jsonb)
 into v_centers
 from (
   select c.center_code,c.name,c.country_code,c.region_name,
          (select count(*) from spark_members m where m.center_id=c.id and m.active=true) members,
          (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=now()-interval '7 days') week_activities,
          (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=date_trunc('day',now())) today_activities,
          (select coalesce(sum(l.amount),0) from spark_ledger l where l.center_id=c.id) total_xp
   from spark_centers c where c.status in ('active','pilot')
 ) q;

 with codes(code) as (values ('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN'))
 select jsonb_object_agg(code,cnt) into v_flames
 from (
   select codes.code,coalesce(x.cnt,0) cnt
   from codes
   left join (
     select coalesce(r.flame_code,'GOOD') code,count(*) cnt
     from spark_activities a
     left join spark_activity_rules r on r.activity_type=a.activity_type
     where a.created_at>=now()-interval '7 days'
     group by coalesce(r.flame_code,'GOOD')
   ) x on x.code=codes.code
 ) q;

 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'flame_code',m.flame_code,'status',m.status,'completions',(select count(*) from spark_mission_completions mc where mc.mission_id=m.id)) order by m.created_at desc),'[]'::jsonb)
 into v_missions from spark_missions m where m.status in ('published','ended');

 select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'organization_name',i.organization_name,'region_name',i.region_name,'status',i.status,'created_at',i.created_at) order by i.created_at desc),'[]'::jsonb)
 into v_interests from (select * from spark_center_interest where status='new' order by created_at desc limit 10)i;

 return jsonb_build_object('ok',true,'summary',v_summary,'countries',v_countries,'centers',v_centers,'flames_7d',v_flames,'missions',v_missions,'new_interests',v_interests);
end
$function$;

grant execute on function public.spark_hq_command_dashboard() to authenticated;
