-- GLOBAL SPARK PHASE 2-3 · MISSION v1 execution grants
-- Public mission reading is available to anon/authenticated. Mutating and member/HQ RPCs require authenticated access.

revoke all on function public.spark_confirm_mission(uuid,uuid) from public;
revoke all on function public.spark_member_missions(uuid) from public;
revoke all on function public.spark_hq_missions() from public;
revoke all on function public.spark_hq_save_mission(uuid,text,text,text,text,text,text,text,timestamptz,timestamptz) from public;
revoke all on function public.spark_hq_set_mission_status(uuid,text) from public;
revoke all on function public.spark_public_missions(integer) from public;

grant execute on function public.spark_confirm_mission(uuid,uuid) to authenticated, service_role;
grant execute on function public.spark_member_missions(uuid) to authenticated, service_role;
grant execute on function public.spark_hq_missions() to authenticated, service_role;
grant execute on function public.spark_hq_save_mission(uuid,text,text,text,text,text,text,text,timestamptz,timestamptz) to authenticated, service_role;
grant execute on function public.spark_hq_set_mission_status(uuid,text) to authenticated, service_role;
grant execute on function public.spark_public_missions(integer) to anon, authenticated, service_role;
