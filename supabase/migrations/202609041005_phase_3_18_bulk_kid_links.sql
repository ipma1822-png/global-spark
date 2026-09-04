-- GLOBAL SPARK PHASE 3-18 · bulk issue only missing active child links
create or replace function public.spark_bulk_issue_missing_kid_links(p_center_code text)
returns table(member_id uuid, display_name text, member_code text, token text)
language plpgsql security definer set search_path='' as $function$
declare v_center_id uuid; r record; v_token text;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select c.id into v_center_id from public.spark_centers c where c.center_code=p_center_code and c.status in ('pilot','active');
 if v_center_id is null then raise exception 'CENTER_NOT_FOUND'; end if;
 if not public.spark_is_staff(v_center_id) then raise exception 'FORBIDDEN'; end if;
 for r in
   select m.id,m.display_name,m.member_code
   from public.spark_members m
   where m.center_id=v_center_id and m.active=true
     and not exists(select 1 from public.spark_kid_links k where k.member_id=m.id and k.active=true)
   order by m.display_name
 loop
   v_token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
   insert into public.spark_kid_links(member_id,token_hash,created_by,active)
   values(r.id,extensions.digest(v_token,'sha256'),auth.uid(),true)
   on conflict(member_id) do update set token_hash=excluded.token_hash,created_by=excluded.created_by,active=true,created_at=now(),last_used_at=null;
   member_id:=r.id; display_name:=r.display_name; member_code:=r.member_code; token:=v_token; return next;
 end loop;
end $function$;
revoke all on function public.spark_bulk_issue_missing_kid_links(text) from public;
grant execute on function public.spark_bulk_issue_missing_kid_links(text) to authenticated;