---
phase: 04-forms-database
plan: 01
subsystem: backend
tags: [database, server-actions, zod, drizzle, forms]
dependency-graph:
  requires: [01-02 (database schema)]
  provides: [submitRegistration, submitAmbassador, card-utils]
  affects: [04-02 (client form components)]
tech-stack:
  added: [drizzle-orm (spechack dep)]
  patterns: [Server Action + Zod + FormState, deterministic card generation]
key-files:
  created:
    - apps/spechack/src/lib/card-utils.ts
    - apps/spechack/src/app/[locale]/_actions/register.actions.ts
    - apps/spechack/src/app/[locale]/_actions/ambassador.actions.ts
  modified:
    - packages/database/src/schema.ts
    - apps/spechack/package.json
decisions:
  - Used serial column type for agent_number instead of manual sequence
  - Added drizzle-orm as direct spechack dependency for eq operator
  - Random builder class at registration, deterministic gradient from name
metrics:
  duration: 4.2m
  completed: 2026-02-14
---

# Phase 4 Plan 1: Schema Fix + Server Actions Summary

Server Actions with Zod validation for registration (duplicate detection, sequential agent numbers, card gradient generation) and ambassador forms, backed by corrected Neon schema.

## What Was Done

### Task 1: Fix database schema and push to Neon
- Replaced `spechack_track` enum values from `["web", "mobile", "ai", "iot", "open"]` to `["virtual", "hub"]`
- Changed `agentNumber` from `integer` to `serial` for collision-free auto-increment
- Added `gradientData: text("gradient_data")` column to store JSON gradient data
- Replaced `university` + `motivation` fields with single `community` field in ambassadors table
- Pushed schema to Neon (types + tables created via manual SQL due to drizzle-kit pgSchema limitation)

### Task 2: Card utils and Server Actions
- Ported server-safe card generation from blueprint: `hashStr`, `generateCardGradient`, `getRandomBuilderClass`, `getDeterministicBuilderClass`, `BUILDER_CLASSES` (6 classes with bilingual descriptions), `GRADIENT_COMBOS` (8 HSL pairs)
- Created `submitRegistration` Server Action: Zod validation, duplicate email detection (returns existing card data), random builder class assignment, deterministic gradient from name, sequential agent number via SERIAL
- Created `submitAmbassador` Server Action: Zod validation, database insertion, no duplicate detection (multiple applications allowed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] drizzle-kit pgSchema push failure**
- **Found during:** Task 1
- **Issue:** `drizzle-kit push --force` failed because it always generates CREATE TYPE statements for all enum types, even when they already exist in the DB. This is a known limitation with `pgSchema()`.
- **Fix:** Dropped stale `spechack_ambassador_status` enum from a previous partial push, ran push to create all types, then created tables via manual SQL since drizzle-kit couldn't handle the incremental push.
- **Files modified:** None (DB-only fix)
- **Commit:** 19faded

**2. [Rule 3 - Blocking] Missing drizzle-orm dependency in spechack**
- **Found during:** Task 2 (build verification)
- **Issue:** `import { eq } from "drizzle-orm"` in register.actions.ts failed TypeScript compilation because drizzle-orm wasn't in spechack's package.json (only in `@404tf/database`)
- **Fix:** Added `drizzle-orm` as a direct dependency of spechack app
- **Files modified:** apps/spechack/package.json, bun.lock
- **Commit:** d7514ac

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `serial` column type for agent_number | Simpler than manual sequence; Drizzle auto-creates PostgreSQL SERIAL which handles concurrency |
| `drizzle-orm` as direct spechack dep | Landing app avoids `eq` imports, but spechack needs duplicate detection; direct dep is cleaner than re-exporting |
| Random builder class, deterministic gradient | Per CARD-04: builder class is "randomly assigned" at registration; gradient is deterministic from name for consistency |
| `as Record<string, string[]>` for Zod v4 errors | Zod v4 `flatten().fieldErrors` returns compatible shape but TypeScript needs explicit cast for the generic `Record` type |
| Manual SQL table creation | Workaround for drizzle-kit pgSchema limitation; tables match schema.ts exactly |

## Verification

- `bun run build` compiles successfully (TypeScript + Next.js)
- `bunx @biomejs/biome check` passes with no errors on all 3 new files
- Schema in Neon has correct track enum, serial agent_number, gradientData column, community field
- All exports verified: `submitRegistration`, `RegisterFormState`, `submitAmbassador`, `AmbassadorFormState`, `generateCardGradient`, `getRandomBuilderClass`, `getDeterministicBuilderClass`, `BUILDER_CLASSES`, `BuilderClass`

## Self-Check: PASSED

- [x] apps/spechack/src/lib/card-utils.ts -- FOUND
- [x] apps/spechack/src/app/[locale]/_actions/register.actions.ts -- FOUND
- [x] apps/spechack/src/app/[locale]/_actions/ambassador.actions.ts -- FOUND
- [x] packages/database/src/schema.ts -- FOUND
- [x] Commit 19faded -- FOUND
- [x] Commit d7514ac -- FOUND
