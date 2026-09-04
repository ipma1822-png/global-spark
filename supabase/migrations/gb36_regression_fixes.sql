-- GLOBAL SPARK GB-36 v3.52.0
-- Regression fixes discovered by end-to-end integration testing.

-- 1) HQ onboarding watch: actual column is approval_center_ready.
do $$
declare d text;
begin
  select pg_get_functiondef(p.oid) into d
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='spark_hq_onboarding_watch' and pg_get_function_identity_arguments(p.oid)='';
  if d is null then raise exception 'spark_hq_onboarding_watch not found'; end if;
  d:=replace(d,'approval_center_confirmed','approval_center_ready');
  execute d;
end $$;

-- 2) Operational health: task completion status is done, not completed.
do $$
declare d text;
begin
  select pg_get_functiondef(p.oid) into d
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='spark_internal' and p.proname='center_health_rows' and pg_get_function_identity_arguments(p.oid)='';
  if d is null then raise exception 'spark_internal.center_health_rows not found'; end if;
  d:=replace(d,'''completed''','''done''');
  execute d;
end $$;

-- 3) Mobile HOME onboarding progress is an object: {done,total,percent}.
do $$
declare d text;
begin
  select pg_get_functiondef(p.oid) into d
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='spark_center_mobile_home' and pg_get_function_identity_arguments(p.oid)='p_center_code text';
  if d is null then raise exception 'spark_center_mobile_home not found'; end if;
  d:=replace(d,'coalesce((v_onboarding->>''progress'')::int,0)','coalesce((v_onboarding->''progress''->>''percent'')::int,0)');
  execute d;
end $$;
