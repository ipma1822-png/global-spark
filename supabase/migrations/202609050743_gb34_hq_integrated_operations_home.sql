-- GLOBAL SPARK GB-34 · v3.50.0
create or replace function public.spark_hq_integrated_operations_home()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.spark_is_hq_admin() then raise exception 'HQ_FORBIDDEN'; end if;

  select jsonb_build_object(
    'generated_at', now(),
    'summary', jsonb_build_object(
      'centers_total',(select count(*) from public.spark_centers where status in ('pilot','active')),
      'official_centers',(select count(*) from public.spark_centers where status in ('pilot','active') and designation_status='official'),
      'applications_pending',(select count(*) from public.spark_hq_applications where status in ('pending','submitted','reviewing')),
      'onboarding_open_signals',(select count(*) from public.spark_center_onboarding_signals where status not in ('resolved','dismissed')),
      'onboarding_high_signals',(select count(*) from public.spark_center_onboarding_signals where status not in ('resolved','dismissed') and severity in ('high','critical')),
      'support_tasks_open',(select count(*) from public.spark_onboarding_support_tasks ost join public.spark_operational_tasks t on t.id=ost.task_id where t.status not in ('done','cancelled')),
      'alerts_open',(select count(*) from public.spark_operational_alerts where status not in ('resolved','dismissed')),
      'tasks_open',(select count(*) from public.spark_operational_tasks where status not in ('done','cancelled')),
      'tasks_overdue',(select count(*) from public.spark_operational_tasks where status not in ('done','cancelled') and due_at is not null and due_at < now()),
      'recertification_pending',(select count(*) from public.spark_center_periodic_evaluations where recertification_status='pending'),
      'recertification_review',(select count(*) from public.spark_center_periodic_evaluations where evaluation_status in ('review_needed','support_needed','insufficient_data') and recertification_status='pending'),
      'award_candidates_open',(select count(*) from public.spark_center_award_candidates where coalesce(decision_status,'pending') in ('pending','shortlisted')),
      'campaigns_live',(select count(*) from public.spark_campaigns where status='published' and starts_at<=now() and (ends_at is null or ends_at>=now())),
      'reports_today',(select count(*) from public.spark_scoped_reports where generated_at::date=(now() at time zone 'Asia/Seoul')::date)
    ),
    'priority_queue', coalesce((select jsonb_agg(x order by (x->>'priority_rank')::int,x->>'created_at') from (select jsonb_build_object('kind','application','priority_rank',2,'title','공식 성장기지 신청 검토','detail',coalesce(a.organization_name,'신청기관'),'created_at',a.created_at,'href','official-growth-base-admin.html') x from public.spark_hq_applications a where a.status in ('pending','submitted','reviewing') order by a.created_at asc limit 8) q),'[]'::jsonb)
      || coalesce((select jsonb_agg(x order by (x->>'priority_rank')::int,x->>'created_at') from (select jsonb_build_object('kind','onboarding','priority_rank',case when s.severity in ('critical','high') then 1 else 3 end,'title',s.title,'detail',c.name,'created_at',s.created_at,'href','hq-onboarding-watch.html') x from public.spark_center_onboarding_signals s join public.spark_centers c on c.id=s.center_id where s.status not in ('resolved','dismissed') order by case when s.severity in ('critical','high') then 0 else 1 end,s.created_at asc limit 8) q),'[]'::jsonb)
      || coalesce((select jsonb_agg(x order by (x->>'priority_rank')::int,x->>'created_at') from (select jsonb_build_object('kind','task','priority_rank',case when t.due_at is not null and t.due_at<now() then 1 when t.priority in ('critical','high') then 2 else 4 end,'title',t.title,'detail',c.name,'created_at',t.created_at,'href','operational-tasks.html') x from public.spark_operational_tasks t join public.spark_centers c on c.id=t.center_id where t.status not in ('done','cancelled') order by case when t.due_at is not null and t.due_at<now() then 0 else 1 end,t.created_at asc limit 8) q),'[]'::jsonb),
    'modules', jsonb_build_array(
      jsonb_build_object('key','applications','label','공식 성장기지 지정','href','official-growth-base-admin.html'),
      jsonb_build_object('key','onboarding','label','온보딩 관제','href','hq-onboarding-watch.html'),
      jsonb_build_object('key','support','label','온보딩 지원업무','href','hq-onboarding-support.html'),
      jsonb_build_object('key','health','label','운영건강도','href','center-health.html'),
      jsonb_build_object('key','tasks','label','운영업무','href','operational-tasks.html'),
      jsonb_build_object('key','performance','label','관리자 성과','href','admin-performance.html'),
      jsonb_build_object('key','recertification','label','정기평가·재인증','href','hq-recertification.html'),
      jsonb_build_object('key','awards','label','우수·포상 후보','href','hq-award-candidates.html'),
      jsonb_build_object('key','campaigns','label','글로벌 캠페인','href','campaign-operations.html'),
      jsonb_build_object('key','reports','label','통계·보고서','href','scoped-reports.html'),
      jsonb_build_object('key','lifecycle','label','공식 성장기지 수명주기','href','hq-growth-base-lifecycle.html'),
      jsonb_build_object('key','world','label','WORLD NETWORK','href','world-network.html')
    )
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.spark_hq_integrated_operations_home() from public, anon;
grant execute on function public.spark_hq_integrated_operations_home() to authenticated;
