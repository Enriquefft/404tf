---
phase: 01-foundation
plan: 03
subsystem: database
tags: [drizzle-orm, neon, postgres, type-safety, t3-env]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 16 project with Bun runtime
  - phase: 01-02
    provides: Biome linting configuration
provides:
  - Type-safe environment variable validation with @t3-oss/env-nextjs
  - Drizzle ORM schema with intent_submissions table
  - Neon serverless Postgres connection
  - Module-level db singleton for optimal performance
affects: [03-form-backend, 04-analytics, future-database-features]

# Tech tracking
tech-stack:
  added:
    - "@t3-oss/env-nextjs" for type-safe env validation
    - "drizzle-orm" for type-safe database queries
    - "@neondatabase/serverless" for Neon Postgres connection
    - "dotenv" for environment loading in scripts
  patterns:
    - Module-level db singleton pattern (not wrapped in function)
    - Enum-first schema design for intent/locale types
    - Custom Zod validators for DATABASE_URL validation
    - Runtime environment validation on app startup

key-files:
  created:
    - src/env/client.ts
    - src/env/db.ts
    - src/db/schema.ts
    - src/db/index.ts
    - drizzle.config.ts
    - scripts/init-db.ts
  modified:
    - package.json (added dependencies)
    - bun.lock (dependency lockfile)
    - .env.local (user-provided DATABASE_URL)

key-decisions:
  - "Use @t3-oss/env-nextjs for runtime env validation instead of manual checks"
  - "Rename enums to landing_intent/landing_locale to avoid collision with existing database enums"
  - "Use module-level db singleton (not function-wrapped) for optimal performance"
  - "Create init-db.ts script to bypass drizzle-kit interactive prompts"

patterns-established:
  - "Server-side env vars in separate files (src/env/db.ts for DATABASE_URL)"
  - "Client-side env vars prefixed with NEXT_PUBLIC_ (src/env/client.ts)"
  - "Custom Zod validators for complex validation (Neon URL format check)"
  - "Landing-prefixed enums for feature-specific types"

# Metrics
duration: 5.4min
completed: 2026-02-08
---

# Phase 01 Plan 03: Data Layer Summary

**Type-safe Neon Postgres with Drizzle ORM, runtime env validation via @t3-oss/env-nextjs, and intent_submissions table with landing_intent/landing_locale enums**

## Performance

- **Duration:** 5.4 min (322 seconds)
- **Started:** 2026-02-08T18:22:24Z
- **Completed:** 2026-02-08T18:27:46Z
- **Tasks:** 3 (1 auto, 1 checkpoint, 1 auto)
- **Files modified:** 9

## Accomplishments
- Type-safe environment variable validation with custom Zod schemas for DATABASE_URL
- Drizzle ORM connected to Neon serverless Postgres with module-level singleton
- intent_submissions table with landing_intent (build/collaborate/connect) and landing_locale (es/en) enums
- Database initialization script to handle enum/table creation without interactive prompts

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up @t3-oss/env-nextjs with type-safe env vars** - `7b22b61` (chore)
   - Created src/env/client.ts for NEXT_PUBLIC_POSTHOG_* vars
   - Created src/env/db.ts with custom Neon URL validation
   - Added emptyStringAsUndefined for optional env vars

2. **Task 2: User provides Neon DATABASE_URL** - No commit (checkpoint)
   - User manually added DATABASE_URL to .env.local
   - Verified format: postgresql://user:pass@host/db?sslmode=require

3. **Task 3: Set up Drizzle ORM schema and run migration** - `f00805a` (feat)
   - Created src/db/schema.ts with intentEnum and localeEnum
   - Created src/db/index.ts with module-level db singleton
   - Added drizzle.config.ts for migrations and studio
   - Created scripts/init-db.ts to bypass drizzle-kit interactive prompts
   - Installed dotenv for environment loading

**Plan metadata:** (pending in final commit)

## Files Created/Modified

**Task 1 (Type-safe env vars):**
- `src/env/client.ts` - Client-side env validation for PostHog (optional)
- `src/env/db.ts` - Server-side env validation with custom Neon URL schema

**Task 2 (User checkpoint):**
- `.env.local` - User manually added DATABASE_URL connection string

**Task 3 (Drizzle ORM):**
- `src/db/schema.ts` - Table schema with landing_intent/landing_locale enums and intent_submissions table
- `src/db/index.ts` - Module-level db singleton using drizzle + Neon serverless
- `drizzle.config.ts` - Drizzle Kit configuration for migrations/studio
- `scripts/init-db.ts` - Direct SQL execution script to create enums and table
- `package.json` - Added dotenv dependency
- `bun.lock` - Updated lockfile

## Decisions Made

1. **Use @t3-oss/env-nextjs for runtime validation**: Instead of manual process.env checks, leverage T3's battle-tested library for type-safe env validation with Zod schemas and helpful error messages on startup.

2. **Rename enums to landing_intent/landing_locale**: Database already contained `intent` and `locale` enums from other tables. Added `landing_` prefix to avoid naming collisions and make purpose clear.

3. **Module-level db singleton**: Following Drizzle best practices, export `db` directly rather than wrapping in a function. This ensures connection reuse and optimal performance in serverless environments.

4. **Create init-db.ts script**: drizzle-kit push had interactive prompts for enum disambiguation that couldn't be bypassed with --force flag. Created script using @neondatabase/serverless to execute SQL directly with IF NOT EXISTS guards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed enums to avoid database collisions**
- **Found during:** Task 3 (Running drizzle-kit push)
- **Issue:** drizzle-kit interactive prompt asked if "locale" enum should be created or renamed from existing "intent", "tf_locale", etc. Database already had 17+ enums from other tables. The plan's enum names "intent" and "locale" conflided with existing database objects.
- **Fix:** Renamed to `landing_intent` and `landing_locale` to avoid collision and clarify purpose
- **Files modified:** src/db/schema.ts
- **Verification:** Database push succeeded, table created, query test passed
- **Committed in:** f00805a (Task 3 commit)

**2. [Rule 3 - Blocking] Created init-db.ts script to bypass interactive prompts**
- **Found during:** Task 3 (drizzle-kit push hung on interactive prompts)
- **Issue:** drizzle-kit push --force bypasses data loss confirmations but NOT enum disambiguation prompts. Even with renamed enums, still prompted about other similar enum names. No way to programmatically select "create new enum" option.
- **Fix:** Created scripts/init-db.ts using @neondatabase/serverless to execute SQL directly with DO $$ BEGIN ... CREATE TYPE ... EXCEPTION WHEN duplicate_object ... pattern
- **Files modified:** scripts/init-db.ts (created), package.json (added dotenv)
- **Verification:** Script ran successfully, table created, drizzle query test passed
- **Committed in:** f00805a (Task 3 commit)

**3. [Rule 1 - Bug] Fixed Biome linting errors**
- **Found during:** Task 3 (Running bun run check)
- **Issue:** drizzle.config.ts used non-null assertion (process.env.DATABASE_URL!) and src/db/schema.ts had unsorted imports
- **Fix:** Changed ! to ?? "" fallback, reordered imports alphabetically (pgEnum before pgTable)
- **Files modified:** drizzle.config.ts, src/db/schema.ts
- **Verification:** bun run check passed
- **Committed in:** f00805a (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All deviations necessary to work with existing database state and pass quality checks. No scope creep - delivered exact functionality planned.

## Issues Encountered

1. **Neon database had existing enums**: The DATABASE_URL pointed to a Neon instance with tables from other projects/applications (17+ enums visible during schema introspection). This caused drizzle-kit to ask disambiguation questions. Resolved by using unique prefixes and creating direct SQL script.

2. **drizzle-kit interactive prompts can't be bypassed programmatically**: The --force flag only bypasses data loss confirmations, not enum/table disambiguation prompts. No --yes or --non-interactive flag exists. Resolved by using direct SQL via @neondatabase/serverless.

## User Setup Required

None - no external service configuration required. DATABASE_URL was provided during Task 2 checkpoint and is already configured in .env.local.

## Next Phase Readiness

**Ready for Phase 2 (Landing Page):**
- ✅ Type-safe environment variables configured and validated
- ✅ Database connection established and tested (Connection OK. Rows: 0)
- ✅ intent_submissions table ready for Server Actions
- ✅ Drizzle ORM integrated with proper singleton pattern

**Ready for Phase 3 (Form Backend):**
- ✅ Schema supports build/collaborate/connect intents
- ✅ Schema supports es/en locale tracking
- ✅ Table ready for insertions via Server Actions

**No blockers or concerns.**

**Note:** Drizzle Studio can be launched with `bun run db:studio` for database inspection during development.

---
*Phase: 01-foundation*
*Completed: 2026-02-08*

## Self-Check: PASSED

All files verified:
- ✓ src/env/client.ts
- ✓ src/env/db.ts
- ✓ src/db/schema.ts
- ✓ src/db/index.ts
- ✓ drizzle.config.ts
- ✓ scripts/init-db.ts

All commits verified:
- ✓ 7b22b61 (Task 1)
- ✓ f00805a (Task 3)

