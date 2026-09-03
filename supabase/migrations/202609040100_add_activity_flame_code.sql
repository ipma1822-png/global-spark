-- GLOBAL SPARK PHASE 2-2 · 5대 불꽃 대표 분류
-- 기존 활동·XP·원장·RPC는 변경하지 않고 활동규칙에 상위 분류만 추가한다.

alter table public.spark_activity_rules
  add column if not exists flame_code text;

alter table public.spark_activity_rules
  drop constraint if exists spark_activity_rules_flame_code_check;

alter table public.spark_activity_rules
  add constraint spark_activity_rules_flame_code_check
  check (flame_code is null or flame_code in ('GOOD','SAFE','EARTH','CHALLENGE','CITIZEN'));

update public.spark_activity_rules
set flame_code = case activity_type
  when 'care_friend' then 'GOOD'
  when 'help_parents' then 'GOOD'
  when 'keep_promise' then 'GOOD'
  when 'other_good_action' then 'GOOD'
  when 'service_share' then 'CITIZEN'
  when 'tidy' then 'CITIZEN'
  when 'exercise_challenge' then 'CHALLENGE'
  when 'reading_learning' then 'CHALLENGE'
  when 'courage' then 'SAFE'
  else flame_code
end
where activity_type in (
  'care_friend','help_parents','keep_promise','other_good_action',
  'service_share','tidy','exercise_challenge','reading_learning','courage'
);

comment on column public.spark_activity_rules.flame_code is
  'GLOBAL SPARK 대표 불꽃: GOOD, SAFE, EARTH, CHALLENGE, CITIZEN. 하나의 활동규칙에 하나의 대표 불꽃을 지정한다.';
