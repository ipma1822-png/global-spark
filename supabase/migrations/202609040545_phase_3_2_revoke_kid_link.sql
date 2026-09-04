create or replace function public.spark_revoke_kid_link(p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_member public.spark_members%rowtype;
  v_count integer := 0;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_member
  from public.spark_members
  where id = p_member_id;
  if not found then raise exception 'MEMBER_NOT_FOUND'; end if;

  if not public.spark_is_staff(v_member.center_id) then raise exception 'FORBIDDEN'; end if;

  update public.spark_kid_links
  set active = false
  where member_id = p_member_id and active = true;
  get diagnostics v_count = row_count;

  return jsonb_build_object('ok', true, 'revoked', v_count > 0);
end
$function$;

revoke all on function public.spark_revoke_kid_link(uuid) from public;
grant execute on function public.spark_revoke_kid_link(uuid) to authenticated;
