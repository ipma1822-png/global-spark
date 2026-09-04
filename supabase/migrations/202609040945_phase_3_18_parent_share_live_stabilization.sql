-- GLOBAL SPARK · PHASE 3-18 · parent share + public live stabilization
create or replace function public.spark_create_member_share(p_member_id uuid)
returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_member public.spark_members%rowtype; v_token text;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_member from public.spark_members where id=p_member_id and active=true;
 if not found then raise exception 'MEMBER_NOT_FOUND'; end if;
 if not public.spark_is_staff(v_member.center_id) then raise exception 'FORBIDDEN'; end if;
 update public.spark_member_shares set active=false where member_id=p_member_id and active=true;
 v_token:=encode(extensions.gen_random_bytes(24),'hex');
 insert into public.spark_member_shares(member_id,token_hash,created_by) values(p_member_id,extensions.digest(v_token,'sha256'),auth.uid());
 return jsonb_build_object('ok',true,'token',v_token,'expires_in_days',180);
end $function$;

create or replace function public.spark_get_public_share(p_token text)
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v_share public.spark_member_shares%rowtype; v_member public.spark_members%rowtype; v_total bigint; v_level integer; v_recent jsonb; v_flames jsonb; v_badges jsonb;
begin
 if p_token is null or length(p_token)<32 then return jsonb_build_object('ok',false); end if;
 select * into v_share from public.spark_member_shares where token_hash=extensions.digest(p_token,'sha256') and active=true and expires_at>now() limit 1;
 if not found then return jsonb_build_object('ok',false); end if;
 select * into v_member from public.spark_members where id=v_share.member_id and active=true;
 if not found then return jsonb_build_object('ok',false); end if;
 select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
 v_level:=floor(v_total/100.0)::int+1;
 select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb) into v_recent from (
   select r.label_ko,r.flame_code,greatest(coalesce(sum(l.amount),0),0)::bigint xp,a.created_at
   from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type left join public.spark_ledger l on l.activity_id=a.id
   where a.member_id=v_member.id group by a.id,r.label_ko,r.flame_code,a.created_at having coalesce(sum(l.amount),0)>0 order by a.created_at desc limit 12
 ) x;
 with codes(code) as (values('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN'))
 select jsonb_object_agg(code,cnt) into v_flames from (
   select codes.code,coalesce(x.cnt,0) cnt from codes left join (
     select r.flame_code code,count(*) cnt from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type
     where a.member_id=v_member.id and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)
     group by r.flame_code
   ) x on x.code=codes.code
 ) z;
 select coalesce(jsonb_agg(jsonb_build_object('code',badge_code,'awarded_at',awarded_at) order by awarded_at),'[]'::jsonb) into v_badges from public.spark_badge_awards where member_id=v_member.id;
 return jsonb_build_object('ok',true,'display_name',v_member.display_name,'total_xp',v_total,'level',v_level,'next_level_xp',v_level*100,'recent',v_recent,'flames',coalesce(v_flames,'{}'::jsonb),'badges',v_badges);
end $function$;

create or replace function public.spark_get_public_live_v370()
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v_today bigint:=0;v_week bigint:=0;v_centers bigint:=0;v_total bigint:=0;v_members bigint:=0;v_center_rows jsonb;v_flames jsonb;v_events jsonb;v_countries jsonb;
begin
 select count(*) into v_centers from spark_centers where status in('pilot','active');
 select count(*) into v_members from spark_members m join spark_centers c on c.id=m.center_id where m.active=true and c.status in('pilot','active');
 select count(*) into v_today from spark_activities a where a.created_at>=date_trunc('day',now()) and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
 select count(*) into v_week from spark_activities a where a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
 select coalesce(sum(amount),0) into v_total from spark_ledger;
 select coalesce(jsonb_agg(jsonb_build_object('center_name',name,'country_code',country_code,'region_name',region_name,'today_count',today_count,'week_count',week_count,'total_xp',total_xp) order by today_count desc,week_count desc),'[]'::jsonb) into v_center_rows from (
   select c.id,c.name,c.country_code,coalesce(c.region_name,'') region_name,
   (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=date_trunc('day',now()) and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) today_count,
   (select count(*) from spark_activities a where a.center_id=c.id and a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) week_count,
   (select coalesce(sum(l.amount),0) from spark_ledger l where l.center_id=c.id) total_xp from spark_centers c where c.status in('pilot','active') order by today_count desc,week_count desc limit 20
 ) q;
 with codes(code) as(values('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN')) select jsonb_object_agg(code,cnt) into v_flames from(
   select codes.code,coalesce(x.cnt,0) cnt from codes left join(
     select coalesce(r.flame_code,'GOOD') code,count(*) cnt from spark_activities a left join spark_activity_rules r on r.activity_type=a.activity_type where a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by coalesce(r.flame_code,'GOOD')
   ) x on x.code=codes.code
 ) z;
 select coalesce(jsonb_agg(jsonb_build_object('center_name',c.name,'country_code',c.country_code,'region_name',coalesce(c.region_name,''),'label_ko',coalesce(r.label_ko,a.activity_type),'flame_code',coalesce(r.flame_code,'GOOD'),'created_at',a.created_at) order by a.created_at desc),'[]'::jsonb) into v_events from(select * from spark_activities order by created_at desc limit 40)a join spark_centers c on c.id=a.center_id and c.status in('pilot','active') left join spark_activity_rules r on r.activity_type=a.activity_type where exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
 select coalesce(jsonb_agg(jsonb_build_object('country_code',country_code,'centers',centers,'week_count',week_count) order by week_count desc),'[]'::jsonb) into v_countries from(
   select coalesce(c.country_code,'--') country_code,count(*) centers,(select count(*) from spark_activities a join spark_centers c2 on c2.id=a.center_id where c2.status in('pilot','active') and coalesce(c2.country_code,'--')=coalesce(c.country_code,'--') and a.created_at>=now()-interval '7 days' and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) week_count from spark_centers c where c.status in('pilot','active') group by c.country_code
 ) q;
 return jsonb_build_object('ok',true,'today_count',v_today,'week_count',v_week,'active_centers',v_centers,'total_members',v_members,'total_xp',v_total,'centers',v_center_rows,'flames_7d',v_flames,'live_events',v_events,'countries',v_countries);
end $function$;
