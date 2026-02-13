---
phase: 01-foundation
plan: 02
subsystem: database
tags: [drizzle, neon, postgres, schema]

requires:
  - phase: none
    provides: standalone schema extension
provides:
  - spechack_participants table with id, agentNumber, name, email (unique), city, track, builderClass, locale, createdAt
  - spechack_ambassadors table with id, name, email, city, university, motivation, status, locale, createdAt
  - spechack_locale, spechack_track, spechack_ambassador_status enums
  - TypeScript types: SpechackParticipant, NewSpechackParticipant, SpechackAmbassador, NewSpechackAmbassador
affects: [phase-4-forms, phase-5-trading-cards, phase-6-challenge-system]

tech-stack:
  added: []
  patterns: [spechack_ enum prefix, nullable agentNumber assigned post-insert]

key-files:
  modified: [packages/database/src/schema.ts]

key-decisions:
  - "agentNumber is nullable — assigned by server action after insert, not auto-increment"
  - "spechack_ prefix on all enums to avoid collision with landing_ enums"
  - "email unique constraint on participants to prevent duplicate registrations"
  - "ambassadorStatus defaults to 'pending'"

patterns-established:
  - "spechack_ prefix for all SpecHack database objects"
  - "Same pgSchema('404 Tech Found') shared between landing and spechack tables"

duration: 2min
completed: 2026-02-13
---

# Plan 01-02: Database Schema Extension Summary

**Extended shared @404tf/database with spechack_participants and spechack_ambassadors tables, 3 spechack-prefixed enums, and 4 TypeScript type exports**

## Performance

- **Duration:** 2 min
- **Completed:** 2026-02-13
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added spechack_participants table with unique email constraint for registration deduplication
- Added spechack_ambassadors table with status enum defaulting to "pending"
- Created 3 spechack-prefixed enums (locale, track, ambassador_status)
- Exported 4 TypeScript types via Drizzle $inferSelect/$inferInsert

## Task Commits

1. **Task 1: Add SpecHack tables and enums to shared database schema** - `c832aa4` (feat)

**Plan metadata:** `9006069` (docs: complete database-schema plan)

## Files Modified
- `packages/database/src/schema.ts` - Extended with spechack tables, enums, and type exports (lines 27-71 added)

## Decisions Made
- agentNumber nullable (assigned post-insert by server action, not DB auto-increment)
- spechack_ prefix on all enums to avoid namespace collision with landing_ enums
- email unique constraint on participants to prevent duplicate registrations
- ambassadorStatus defaults to "pending" for manual review workflow

## Deviations from Plan
None - plan executed as specified

## Issues Encountered
None

## User Setup Required
Database migration needed before Phase 4:
- Run `bun run db:generate` to create migration files
- Run `bun run db:push` to deploy schema to Neon Postgres

## Next Phase Readiness
- Schema ready for Phase 4 (Forms & Database) server actions
- Types available for import in spechack app via @404tf/database
- Existing landing app tables unchanged and functional

---
*Phase: 01-foundation*
*Completed: 2026-02-13*
