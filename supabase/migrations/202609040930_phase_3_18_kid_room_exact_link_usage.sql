-- GLOBAL SPARK · PHASE 3-18 · exact kid-link usage + flame data
create or replace function public.spark_kid_room(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $function$
declare v_member public.spark_members%rowtype; v_link_id uuid; v_member_id uuid; v_total bigint; v_level int; v_recent jsonb; v_rules jsonb;
begin
 if p_token is null or length(p_token)<32 then raise exception 'INVALID_LINK'; end if;
 select k.id,m.id into v_link_id,v_member_id from public.spark_kid_links k join public.spark_members m on m.id=k.member_id where k.active=true and k.token_hash=extensions.digest(p_token,'sha256') and m.active=true limit 1;
 if not found then raise exception 'INVALID_LINK'; end if;
 select * into v_member from public.spark_members where id=v_member_id;
 update public.spark_kid_links set last_used_at=now() where id=v_link_id;
 select coalesce(sum(amount),0) into v_total from public.spark_ledger where member_id=v_member.id;
 v_level:=floor(v_total/100.0)::int+1;
 select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb) into v_recent from (select a.id as activity_id,a.activity_type,r.label_ko,r.flame_code,coalesce(sum(l.amount),0)::bigint as net_xp,a.created_at from public.spark_activities a join public.spark_activity_rules r on r.activity_type=a.activity_type left join public.spark_ledger l on l.activity_id=a.id where a.member_id=v_member.id group by a.id,a.activity_type,r.label_ko,r.flame_code,a.created_at order by a.created_at desc limit 10) x;
 select coalesce(jsonb_agg(jsonb_build_object('activity_type',activity_type,'label_ko',label_ko,'xp',xp,'flame_code',flame_code) order by label_ko),'[]'::jsonb) into v_rules from public.spark_activity_rules where active=true;
 return jsonb_build_object('member',jsonb_build_object('id',v_member.id,'display_name',v_member.display_name,'photo_url',v_member.photo_url),'total_xp',v_total,'level',v_level,'next_level_xp',v_level*100,'recent',v_recent,'rules',v_rules);
end $function$;
