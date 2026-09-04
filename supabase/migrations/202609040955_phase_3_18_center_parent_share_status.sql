create or replace function public.spark_center_growth_dashboard(p_center_code text)
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v_center_id uuid; v_summary jsonb; v_members jsonb;
begin
 select id into v_center_id from public.spark_centers where center_code=p_center_code and status in ('pilot','active');
 if v_center_id is null then raise exception 'CENTER_NOT_FOUND'; end if;
 if not public.spark_is_staff(v_center_id) then raise exception 'CENTER_FORBIDDEN'; end if;
 with member_stats as (
  select m.id,m.display_name,m.member_code,
   coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id),0)::bigint total_xp,
   coalesce((select sum(l.amount) from public.spark_ledger l where l.member_id=m.id and l.created_at>=now()-interval '7 days'),0)::bigint xp_7d,
   (select count(*) from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0))::int activity_7d,
   (select max(a.created_at) from public.spark_activities a where a.member_id=m.id and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) last_activity,
   (select r.flame_code from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by r.flame_code order by count(*) desc,r.flame_code limit 1) dominant_flame,
   coalesce((select max(c) from (select count(*) c from public.spark_activities a where a.member_id=m.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by a.activity_type) q),0)::int repeat_7d,
   coalesce((select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system='spark_kid_self' and a.created_at>=date_trunc('day',now())),0)::int self_today,
   coalesce((select count(*) from public.spark_activities a where a.member_id=m.id and a.source_system='spark_kid_self' and a.created_at>=now()-interval '7 days'),0)::int self_7d,
   exists(select 1 from public.spark_kid_links k where k.member_id=m.id and k.active=true) link_active,
   (select max(k.last_used_at) from public.spark_kid_links k where k.member_id=m.id and k.active=true) link_last_used,
   exists(select 1 from public.spark_member_shares s where s.member_id=m.id and s.active=true and s.expires_at>now()) parent_share_active,
   coalesce((select count(*) from public.spark_campaign_actions ca where ca.member_id=m.id and ca.created_at>=now()-interval '7 days'),0)::int campaign_actions_7d
  from public.spark_members m where m.center_id=v_center_id and m.active=true
 )
 select jsonb_build_object('active_members',count(*),'active_today',count(*) filter(where last_activity>=date_trunc('day',now())),'active_7d',count(*) filter(where last_activity>=now()-interval '7 days'),'inactive_7d',count(*) filter(where last_activity is null or last_activity<now()-interval '7 days'),'xp_7d',coalesce(sum(xp_7d),0),'self_today',coalesce(sum(self_today),0),'self_7d',coalesce(sum(self_7d),0),'self_members_7d',count(*) filter(where self_7d>0),'active_kid_links',count(*) filter(where link_active),'active_parent_shares',count(*) filter(where parent_share_active),'campaign_actions_7d',coalesce(sum(campaign_actions_7d),0),'attention_members',count(*) filter(where last_activity is null or last_activity<now()-interval '7 days' or self_today>=4)),
 coalesce(jsonb_agg(jsonb_build_object('id',id,'display_name',display_name,'member_code',member_code,'total_xp',total_xp,'xp_7d',xp_7d,'activity_7d',activity_7d,'last_activity',last_activity,'dominant_flame',dominant_flame,'repeat_7d',repeat_7d,'self_today',self_today,'self_7d',self_7d,'link_active',link_active,'link_last_used',link_last_used,'parent_share_active',parent_share_active,'campaign_actions_7d',campaign_actions_7d,'needs_attention',(last_activity is null or last_activity<now()-interval '7 days' or self_today>=4),'attention_reason',case when self_today>=4 then '직접기록 많음' when last_activity is null or last_activity<now()-interval '7 days' then '7일 미활동' else null end) order by display_name),'[]'::jsonb)
 into v_summary,v_members from member_stats;
 return jsonb_build_object('ok',true,'summary',coalesce(v_summary,'{}'::jsonb),'members',coalesce(v_members,'[]'::jsonb));
end $function$;