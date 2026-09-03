-- GLOBAL SPARK core schema DRAFT v0.3.0
-- REVIEW ONLY: do not run in production yet.
-- Intentionally stored under supabase/drafts, not migrations.

create extension if not exists pgcrypto;

create table if not exists public.spark_countries (
  id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, created_at timestamptz not null default now()
);
create table if not exists public.spark_regions (
  id uuid primary key default gen_random_uuid(), country_id uuid not null references public.spark_countries(id), name text not null, created_at timestamptz not null default now()
);
create table if not exists public.spark_centers (
  id uuid primary key default gen_random_uuid(), region_id uuid references public.spark_regions(id), center_code text unique not null, name text not null, center_type text not null, status text not null default 'pilot', created_at timestamptz not null default now()
);
create table if not exists public.spark_members (
  id uuid primary key default gen_random_uuid(), public_code text unique not null, display_name text not null, birth_year int, created_at timestamptz not null default now()
);
create table if not exists public.spark_center_memberships (
  center_id uuid not null references public.spark_centers(id), member_id uuid not null references public.spark_members(id), status text not null default 'active', joined_at timestamptz not null default now(), primary key(center_id,member_id)
);
create table if not exists public.spark_activity_types (
  id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, default_xp int not null check(default_xp >= 0), active boolean not null default true
);
create table if not exists public.spark_activities (
  id uuid primary key default gen_random_uuid(), center_id uuid not null references public.spark_centers(id), member_id uuid not null references public.spark_members(id), activity_type_id uuid not null references public.spark_activity_types(id), source_system text not null default 'spark-center', source_event_id text, verified_by uuid, note text, occurred_at timestamptz not null default now(), created_at timestamptz not null default now(), unique(source_system,source_event_id)
);
create table if not exists public.spark_xp_ledger (
  id uuid primary key default gen_random_uuid(), member_id uuid not null references public.spark_members(id), activity_id uuid references public.spark_activities(id), amount int not null, reason text not null, reversal_of uuid references public.spark_xp_ledger(id), created_at timestamptz not null default now()
);

-- Production requirements before execution:
-- RLS policies, authenticated verifier/admin model, server-side XP RPC,
-- immutable ledger enforcement, audit log, privacy-safe aggregate RPCs,
-- idempotency tests and seed rules must be reviewed first.
