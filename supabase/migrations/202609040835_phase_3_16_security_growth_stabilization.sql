-- GLOBAL SPARK · PHASE 3-16 · security and growth stabilization
create or replace function public.spark_sync_member_badges(p_member_id uuid)
returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_xp bigint; v_count bigint; v_center uuid;
begin
 select center_id into v_center from spark_members where id=p_member_id and active=true;
 if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if not (public.spark_is_staff(v_center) or public.spark_is_hq_admin()) then raise exception 'FORBIDDEN'; end if;
 select coalesce(sum(amount),0) into v_xp from spark_ledger where member_id=p_member_id;
 select count(*) into v_count from spark_activities a where a.member_id=p_member_id and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
 if v_xp>=5 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'FIRST_SPARK') on conflict do nothing; end if;
 if v_xp>=25 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'GROWING_25') on conflict do nothing; end if;
 if v_xp>=50 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'GROWING_50') on conflict do nothing; end if;
 if v_xp>=100 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'LEVEL_100') on conflict do nothing; end if;
 if v_count>=25 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'ACTION_25') on conflict do nothing; end if;
 return jsonb_build_object('ok',true,'total_xp',v_xp,'activity_count',v_count,'badges',(select coalesce(jsonb_agg(jsonb_build_object('code',badge_code,'awarded_at',awarded_at) order by awarded_at),'[]'::jsonb) from spark_badge_awards where member_id=p_member_id));
end $function$;
create or replace function public.spark_member_growth_analysis(p_member_id uuid)
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v_center uuid; v_total bigint; v_flames jsonb; v_weak text;
begin
 select center_id into v_center from spark_members where id=p_member_id and active=true;
 if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if not (public.spark_is_staff(v_center) or public.spark_is_hq_admin()) then raise exception 'CENTER_FORBIDDEN'; end if;
 select coalesce(sum(amount),0) into v_total from spark_ledger where member_id=p_member_id;
 with codes(code,ord) as (values ('GOOD',1),('SAFE',2),('EARTH',3),('CHALLENGE',4),('CITIZEN',5)), counts as (
  select c.code,c.ord,coalesce(x.cnt,0) cnt from codes c left join (
   select coalesce(r.flame_code,'GOOD') code,count(*) cnt from spark_activities a left join spark_activity_rules r on r.activity_type=a.activity_type
   where a.member_id=p_member_id and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)
   group by coalesce(r.flame_code,'GOOD')) x on x.code=c.code)
 select jsonb_object_agg(code,cnt),(select code from counts order by cnt asc,ord asc limit 1) into v_flames,v_weak from counts;
 return jsonb_build_object('ok',true,'total_xp',v_total,'flames',v_flames,'recommended_flame',v_weak);
end $function$;
revoke all on function public.spark_sync_member_badges(uuid) from public,anon;
revoke all on function public.spark_member_growth_analysis(uuid) from public,anon;
grant execute on function public.spark_sync_member_badges(uuid) to authenticated;
grant execute on function public.spark_member_growth_analysis(uuid) to authenticated;
