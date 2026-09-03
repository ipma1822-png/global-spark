-- GLOBAL SPARK · CLASS CONNECTOR v1.0
-- Run ONLY in GLOBAL SPARK / global-spark.
-- Adds external identity/photo fields. Existing members/XP are preserved.

alter table public.spark_members add column if not exists photo_url text;
alter table public.spark_members add column if not exists source_system text;
alter table public.spark_members add column if not exists source_member_id text;
alter table public.spark_members add column if not exists source_student_code text;

create unique index if not exists spark_members_external_identity_uq
on public.spark_members(source_system,source_member_id)
where source_system is not null and source_member_id is not null;
