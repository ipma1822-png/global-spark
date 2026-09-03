-- GLOBAL SPARK HQ v0.5.0 — REVIEW DRAFT, NOT AUTO-MIGRATION
-- Independent GLOBAL SPARK project only.

-- Core principles:
-- * center/member/activity hierarchy
-- * official rule-based XP
-- * append-only XP ledger
-- * source_event_id idempotency
-- * no arbitrary XP entered by teachers
-- * no dependency on CLASS/ACTS/IDP tables

create table if not exists public.spark_activity_rules (
  activity_type text primary key,
  label_ko text not null,
  xp integer not null check (xp >= 0),
  active boolean not null default true
);

create table if not exists public.spark_activities (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null,
  member_id uuid not null,
  activity_type text not null references public.spark_activity_rules(activity_type),
  memo text,
  verified_by uuid,
  source_system text not null default 'spark_center',
  source_event_id text,
  created_at timestamptz not null default now(),
  unique(source_system, source_event_id)
);

create table if not exists public.spark_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  center_id uuid not null,
  activity_id uuid references public.spark_activities(id),
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

insert into public.spark_activity_rules(activity_type,label_ko,xp) values
('help_parents','부모님 돕기',5),
('care_friend','친구 배려',5),
('tidy','정리정돈',5),
('keep_promise','약속 지키기',5),
('exercise_challenge','운동·도전',5),
('reading_learning','독서·학습',5),
('service_share','봉사·나눔',5),
('courage','용기 있는 행동',5)
on conflict (activity_type) do nothing;

-- IMPORTANT:
-- Do not run this draft until spark_centers/spark_members, RLS policies,
-- authenticated center roles, RPC transaction logic, and minor privacy rules
-- are reviewed together.
