# GLOBAL SPARK HQ v0.3.0
Official platform prototype for the GLOBAL SPARK MOVEMENT.

## Included
- `index.html` — GLOBAL SPARK HQ public MVP
- `center.html` — one-hand SPARK CENTER activity input
- `my-spark.html` — child/parent MY SPARK MVP
- `docs/ARCHITECTURE-v0.3.0.md` — independent global architecture
- `supabase/drafts/001_core_schema.sql` — **review-only schema draft**

## Safety
This version does **not** connect to or modify Supabase. The SQL is deliberately under `supabase/drafts/`, not `supabase/migrations/`, because production deployment is not approved yet. Existing CLASS, IDP, ACTS and Global News24 systems are untouched.

## Test
Open `center.html`, register activities for 김민규, then open `my-spark.html`. Both pages use the same browser localStorage test ledger for v0.3.0.
