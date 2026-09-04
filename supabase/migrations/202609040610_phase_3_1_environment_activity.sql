-- GLOBAL SPARK · PHASE 3-1 · v3.1.0
-- Add the first official EARTH flame activity without changing existing XP rules.

insert into public.spark_activity_rules (activity_type, label_ko, xp, active, flame_code)
values ('environment_care', '환경보호·절약', 5, true, 'EARTH')
on conflict (activity_type) do update
set label_ko = excluded.label_ko,
    xp = excluded.xp,
    active = true,
    flame_code = 'EARTH';
