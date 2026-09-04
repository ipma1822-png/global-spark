create or replace function public.spark_member_growth_analysis(p_member_id uuid)
returns jsonb language plpgsql stable security definer set search_path='public' as $$
declare v_center uuid; v_total bigint; v_flames jsonb; v_weak text; begin
 select center_id into v_center from spark_members where id=p_member_id and active=true;
 if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if not spark_is_staff(v_center) then raise exception 'CENTER_FORBIDDEN'; end if;
 select coalesce(sum(amount),0) into v_total from spark_ledger where member_id=p_member_id;
 with codes(code) as (values ('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN')),
 counts as (select c.code,coalesce(x.cnt,0) cnt from codes c left join (select a.flame_code code,count(*) cnt from spark_activities a where a.member_id=p_member_id and a.flame_code is not null and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by a.flame_code)x using(code))
 select jsonb_object_agg(code,cnt), (select code from counts order by cnt asc,code limit 1) into v_flames,v_weak from counts;
 return jsonb_build_object('ok',true,'total_xp',v_total,'flames',v_flames,'recommended_flame',v_weak);
end $$;
grant execute on function public.spark_member_growth_analysis(uuid) to authenticated;