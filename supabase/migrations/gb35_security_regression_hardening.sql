-- GLOBAL SPARK · GB-35 · v3.51.0
-- Security / regression hardening
-- Applied to Supabase project jdlrmtcsbaklbexrjwjq on 2026-09-05 KST.
-- Scope: revoke unintended anonymous access from clearly internal/HQ RPCs.

revoke all on function public.spark_hq_campaign_stats() from public;
revoke all on function public.spark_hq_campaigns() from public;
revoke all on function public.spark_hq_command_dashboard() from public;
revoke all on function public.spark_hq_operational_signals() from public;
revoke all on function public.spark_hq_save_campaign(uuid,text,text,text,timestamptz,timestamptz) from public;
revoke all on function public.spark_hq_set_campaign_status(uuid,text) from public;
revoke all on function public.spark_center_growth_dashboard(text) from public;
revoke all on function public.spark_center_self_activity_monitor(text) from public;
revoke all on function public.spark_member_campaigns(uuid) from public;

grant execute on function public.spark_hq_campaign_stats() to authenticated;
grant execute on function public.spark_hq_campaigns() to authenticated;
grant execute on function public.spark_hq_command_dashboard() to authenticated;
grant execute on function public.spark_hq_operational_signals() to authenticated;
grant execute on function public.spark_hq_save_campaign(uuid,text,text,text,timestamptz,timestamptz) to authenticated;
grant execute on function public.spark_hq_set_campaign_status(uuid,text) to authenticated;
grant execute on function public.spark_center_growth_dashboard(text) to authenticated;
grant execute on function public.spark_center_self_activity_monitor(text) to authenticated;
grant execute on function public.spark_member_campaigns(uuid) to authenticated;
