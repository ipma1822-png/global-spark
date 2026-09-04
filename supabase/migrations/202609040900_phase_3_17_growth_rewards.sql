-- GLOBAL SPARK · PHASE 3-17 · growth rewards
create or replace function public.spark_sync_member_badges(p_member_id uuid)
returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_xp bigint; v_count bigint; v_center uuid; v_campaign_count bigint; v_flame_count int;
begin
 select center_id into v_center from spark_members where id=p_member_id and active=true;
 if v_center is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if not (public.spark_is_staff(v_center) or public.spark_is_hq_admin()) then raise exception 'FORBIDDEN'; end if;
 select coalesce(sum(amount),0) into v_xp from spark_ledger where member_id=p_member_id;
 select count(*) into v_count from spark_activities a where a.member_id=p_member_id and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0);
 select count(*) into v_campaign_count from spark_campaign_actions where member_id=p_member_id;
 select count(*) into v_flame_count from (select distinct r.flame_code from spark_activities a join spark_activity_rules r on r.activity_type=a.activity_type where a.member_id=p_member_id and exists(select 1 from spark_ledger l where l.activity_id=a.id group by l.activity_id having sum(l.amount)>0)) f;
 if v_xp>=5 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'FIRST_SPARK') on conflict do nothing; end if;
 if v_xp>=25 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'GROWING_25') on conflict do nothing; end if;
 if v_xp>=50 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'GROWING_50') on conflict do nothing; end if;
 if v_xp>=100 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'LEVEL_100') on conflict do nothing; end if;
 if v_count>=25 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'ACTION_25') on conflict do nothing; end if;
 if v_flame_count>=5 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'FIVE_FLAMES') on conflict do nothing; end if;
 if v_campaign_count>=1 then insert into spark_badge_awards(member_id,badge_code) values(p_member_id,'CAMPAIGN_ACTION') on conflict do nothing; end if;
 return jsonb_build_object('ok',true,'total_xp',v_xp,'activity_count',v_count,'flame_count',v_flame_count,'campaign_action_count',v_campaign_count,'badges',(select coalesce(jsonb_agg(jsonb_build_object('code',badge_code,'awarded_at',awarded_at) order by awarded_at),'[]'::jsonb) from spark_badge_awards where member_id=p_member_id));
end $function$;
grant execute on function public.spark_sync_member_badges(uuid) to authenticated;
