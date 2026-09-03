-- GLOBAL SPARK HQ v0.6.0 — REVIEW DRAFT ONLY
-- Do NOT auto-run until core tables, center/member schema and RLS are reviewed.

-- Intended contract for browser:
-- select public.spark_register_activity(
--   p_member_id uuid,
--   p_center_code text,
--   p_activity_type text,
--   p_memo text,
--   p_source_event_id text
-- );

-- Server-side transaction must:
-- 1. Resolve active center by center_code.
-- 2. Verify caller is authorized for that center/member.
-- 3. Read XP only from spark_activity_rules.
-- 4. Insert spark_activities.
-- 5. Insert append-only spark_ledger.
-- 6. Return activity_id, xp_awarded, total_xp, level, new_badges.
-- 7. Enforce idempotency on (source_system, source_event_id).
-- 8. Never accept arbitrary XP from the browser.

-- RLS/authorization for minors must be reviewed before implementation.
