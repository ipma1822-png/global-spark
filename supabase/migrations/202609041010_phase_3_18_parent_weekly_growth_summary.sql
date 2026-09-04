-- GLOBAL SPARK PHASE 3-18 · parent weekly growth summary
create or replace function public.spark_get_public_share(p_token text)
returns jsonb language plpgsql stable security definer set search_path='public' as $function$
declare v_share public.spark_member_shares%rowtype; v_member public.spark_members%rowtype; v_total bigint; v_level integer; v_recent jsonb; v_flames jsonb; v_badges jsonb; v_week_count bigint; v_week_xp bigint; v_week_flames jsonb; v_week_campaigns bigint;
begin
 if p_token is null or length(p_token)<32 then return jsonb_build_object('ok',false); end if;
 select * into v_share from public.spark_member_shares where token_hash=extensions.digest(p_token,'sha256') and active=true and expires_at>now() limit 1;
 if not found then return jsonb_build_object('ok',false); end if;
 select * into v_member from public.spark_members where id=v_share.member_id and active=true;
 if not found then return jsonb_build_object('ok',false); end if;
 select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
 v_level:=floor(v_total/100.0)::int+1;
 select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb) into v_recent from (select r.label_ko,r.flame_code,greatest(coalesce(sum(l.amount),0),0)::bigint xp,a.created_at from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type left join public.spark_ledger l on l.activity_id=a.id where a.member_id=v_member.id group by a.id,r.label_ko,r.flame_code,a.created_at having coalesce(sum(l.amount),0)>0 order by a.created_at desc limit 12) x;
 with codes(code) as (values('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN')) select jsonb_object_agg(code,cnt) into v_flames from (select codes.code,coalesce(x.cnt,0) cnt from codes left join (select r.flame_code code,count(*) cnt from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type where a.member_id=v_member.id and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by r.flame_code) x on x.code=codes.code) z;
 select coalesce(jsonb_agg(jsonb_build_object('code',badge_code,'awarded_at',awarded_at) order by awarded_at),'[]'::jsonb) into v_badges from public.spark_badge_awards where member_id=v_member.id;
 select count(*),coalesce(sum(net_xp),0) into v_week_count,v_week_xp from (select a.id,coalesce(sum(l.amount),0)::bigint net_xp from public.spark_activities a left join public.spark_ledger l on l.activity_id=a.id where a.member_id=v_member.id and a.created_at>=now()-interval '7 days' group by a.id having coalesce(sum(l.amount),0)>0) q;
 with codes(code) as (values('GOOD'),('SAFE'),('EARTH'),('CHALLENGE'),('CITIZEN')) select jsonb_object_agg(code,cnt) into v_week_flames from (select codes.code,coalesce(x.cnt,0) cnt from codes left join (select r.flame_code code,count(*) cnt from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type where a.member_id=v_member.id and a.created_at>=now()-interval '7 days' and exists(select 1 from public.spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0) group by r.flame_code) x on x.code=codes.code) z;
 select count(*) into v_week_campaigns from public.spark_campaign_actions ca where ca.member_id=v_member.id and ca.created_at>=now()-interval '7 days';
 return jsonb_build_object('ok',true,'display_name',v_member.display_name,'total_xp',v_total,'level',v_level,'next_level_xp',v_level*100,'recent',v_recent,'flames',coalesce(v_flames,'{}'::jsonb),'badges',v_badges,'week',jsonb_build_object('activity_count',v_week_count,'xp',v_week_xp,'flames',coalesce(v_week_flames,'{}'::jsonb),'campaign_actions',v_week_campaigns));
end $function$;