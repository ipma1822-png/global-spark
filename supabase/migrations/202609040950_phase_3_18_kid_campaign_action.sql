-- GLOBAL SPARK PHASE 3-18 · child self-service campaign actions
create or replace function public.spark_kid_campaigns(p_token text)
returns jsonb language plpgsql stable security definer set search_path='' as $function$
declare v_member_id uuid; v_rows jsonb;
begin
 if p_token is null or length(p_token)<32 then raise exception 'INVALID_LINK'; end if;
 select m.id into v_member_id from public.spark_kid_links k join public.spark_members m on m.id=k.member_id join public.spark_centers c on c.id=m.center_id where k.active=true and k.token_hash=extensions.digest(p_token,'sha256') and m.active=true and c.status in ('pilot','active') order by k.created_at desc limit 1;
 if v_member_id is null then raise exception 'INVALID_LINK'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'title',c.title,'description',c.description,'flame_code',c.flame_code,'starts_at',c.starts_at,'ends_at',c.ends_at,'joined',exists(select 1 from public.spark_campaign_participations cp where cp.campaign_id=c.id and cp.member_id=v_member_id),'action_count',(select count(*) from public.spark_campaign_actions ca where ca.campaign_id=c.id and ca.member_id=v_member_id),'action_activity_type',c.action_activity_type) order by c.starts_at desc),'[]'::jsonb) into v_rows from public.spark_campaigns c where c.status='published' and c.starts_at<=now() and (c.ends_at is null or c.ends_at>=now());
 return v_rows;
end $function$;

create or replace function public.spark_kid_complete_campaign_action(p_token text,p_campaign_id uuid,p_memo text default '')
returns jsonb language plpgsql security definer set search_path='' as $function$
declare v_member public.spark_members%rowtype; v_member_id uuid; v_creator uuid; v_type text; v_xp int; v_activity uuid; v_total bigint; v_today_count int; v_existing int;
begin
 if p_token is null or length(p_token)<32 then raise exception 'INVALID_LINK'; end if;
 select m.id,k.created_by into v_member_id,v_creator from public.spark_kid_links k join public.spark_members m on m.id=k.member_id join public.spark_centers sc on sc.id=m.center_id where k.active=true and k.token_hash=extensions.digest(p_token,'sha256') and m.active=true and sc.status in ('pilot','active') order by k.created_at desc limit 1;
 if v_member_id is null then raise exception 'INVALID_LINK'; end if;
 select * into v_member from public.spark_members where id=v_member_id;
 select c.action_activity_type into v_type from public.spark_campaigns c where c.id=p_campaign_id and c.status='published' and c.starts_at<=now() and (c.ends_at is null or c.ends_at>=now());
 if v_type is null then raise exception 'CAMPAIGN_ACTION_NOT_CONFIGURED'; end if;
 select count(*) into v_existing from public.spark_campaign_actions ca where ca.campaign_id=p_campaign_id and ca.member_id=v_member.id;
 if v_existing>=1 then raise exception 'CAMPAIGN_ACTION_ALREADY_DONE'; end if;
 select count(*) into v_today_count from public.spark_activities a where a.member_id=v_member.id and a.source_system in ('spark_kid_self','spark_campaign_kid') and a.created_at>=date_trunc('day',now());
 if v_today_count>=5 then raise exception 'DAILY_SELF_LIMIT'; end if;
 select r.xp into v_xp from public.spark_activity_rules r where r.activity_type=v_type and r.active=true;
 if v_xp is null then raise exception 'RULE_NOT_FOUND'; end if;
 insert into public.spark_campaign_participations(campaign_id,member_id,center_id,source) values(p_campaign_id,v_member.id,v_member.center_id,'kid_campaign_action') on conflict(campaign_id,member_id) do nothing;
 insert into public.spark_activities(center_id,member_id,activity_type,memo,verified_by,source_system) values(v_member.center_id,v_member.id,v_type,nullif(left(trim(coalesce(p_memo,'')),200),''),v_creator,'spark_campaign_kid') returning id into v_activity;
 insert into public.spark_ledger(center_id,member_id,activity_id,amount,reason,created_by) values(v_member.center_id,v_member.id,v_activity,v_xp,'kid_campaign:'||p_campaign_id::text||':'||v_type,v_creator);
 insert into public.spark_campaign_actions(campaign_id,member_id,center_id,activity_id) values(p_campaign_id,v_member.id,v_member.center_id,v_activity);
 update public.spark_kid_links set last_used_at=now() where active=true and token_hash=extensions.digest(p_token,'sha256');
 select coalesce(sum(l.amount),0) into v_total from public.spark_ledger l where l.member_id=v_member.id;
 return jsonb_build_object('ok',true,'activity_id',v_activity,'xp',v_xp,'total_xp',v_total,'activity_type',v_type,'self_today',v_today_count+1,'self_daily_limit',5);
end $function$;
revoke all on function public.spark_kid_campaigns(text) from public;
revoke all on function public.spark_kid_complete_campaign_action(text,uuid,text) from public;
grant execute on function public.spark_kid_campaigns(text) to anon,authenticated;
grant execute on function public.spark_kid_complete_campaign_action(text,uuid,text) to anon,authenticated;