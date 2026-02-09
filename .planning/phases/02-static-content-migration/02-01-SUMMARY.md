---
phase: 02-static-content-migration
plan: 01
subsystem: ui
tags: [next-intl, lucide-react, i18n, translations, landing-page]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js 16 with App Router, next-intl configuration, Tailwind v4 styling system
provides:
  - Complete translation infrastructure with 64+ keys for landing page (es.json, en.json)
  - Landing page composition with all 11 sections defined
  - Image assets (mascot, logo) copied from original SPA
  - lucide-react icon library installed
  - Component stub exports for type safety
affects: [02-02-navigation-hero, 02-03-content-sections, landing-page-sections]

# Tech tracking
tech-stack:
  added: [lucide-react@0.563.0]
  patterns: [nested translation keys (landing.*), component stub pattern for TypeScript]

key-files:
  created:
    - messages/es.json
    - messages/en.json
    - src/assets/mascot.png
    - src/assets/logo-white.png
    - src/app/[locale]/page.tsx
    - src/app/[locale]/_components/*.tsx (11 stub files)
  modified:
    - src/styles/globals.css
    - package.json
    - tsconfig.json

key-decisions:
  - "Restructure intent.* keys to flat format (buildSubmit, collaborateSubmit, connectSubmit) to avoid JSON key conflicts"
  - "Create component stubs to unblock TypeScript checks in pre-commit hooks"
  - "Add missing translation keys not in LanguageContext: fellowship.b1-b4, fellowship.duration, preincubation.duration, footer.email, footer.location"

patterns-established:
  - "Nested translation structure: landing.{section}.{key}"
  - "Component stub pattern: export null-returning function for TypeScript satisfaction during incremental implementation"
  - "Font utility pattern: .font-mono-accent for eyebrow labels and small caps text"

# Metrics
duration: 4min
completed: 2026-02-09
---

# Phase 2 Plan 1: Foundation Summary

**Complete translation infrastructure with 64+ keys in nested landing.* format, all 11 landing page section stubs created, and lucide-react + image assets ready for implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-09T18:52:46Z
- **Completed:** 2026-02-09T18:56:50Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Created complete es.json and en.json with all 64+ translation keys from original SPA
- Set up landing page composition importing all 11 sections in correct order
- Installed lucide-react and copied mascot/logo assets from original SPA
- Added .font-mono-accent CSS utility for monospace accent text
- Created component stubs to maintain TypeScript type safety during incremental implementation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install lucide-react, copy assets, add CSS utility** - `b10fcbc` (chore)
2. **Task 2: Create complete translation files and update page entry point** - `24463a9` (feat)

## Files Created/Modified
- `messages/es.json` - Spanish translations with nested landing.* structure (64+ keys)
- `messages/en.json` - English translations with identical key structure
- `src/assets/mascot.png` - Tardi mascot image for Hero section
- `src/assets/logo-white.png` - White logo for Navbar and Footer
- `src/app/[locale]/page.tsx` - Landing page composition with all 11 sections
- `src/app/[locale]/_components/*.tsx` - 11 stub component exports (AnnouncementBanner, Navbar, Hero, TractionBar, Houses, Programs, Events, Community, Partners, IntentCTA, Footer)
- `src/styles/globals.css` - Added .font-mono-accent utility with system monospace stack
- `package.json` - Added lucide-react@0.563.0
- `tsconfig.json` - Biome formatting applied (tabs)

## Decisions Made

**1. Restructure intent.* translation keys to flat format**
- Original LanguageContext used inconsistent structure with duplicate keys (intent.build as both string and object)
- Flattened to buildSubmit, collaborateSubmit, connectSubmit, buildHelper, collaborateHelper, connectHelper
- Maintains same semantic grouping while avoiding JSON key conflicts

**2. Create component stubs for TypeScript safety**
- Pre-commit hook runs `tsc --noEmit` which would fail on missing component imports
- Created 11 stub files exporting null-returning functions
- Unblocks type checking while maintaining clean separation between setup (Plan 02-01) and implementation (Plans 02-02, 02-03)
- Stubs will be replaced with full implementations in subsequent plans

**3. Add missing translation keys from hardcoded values**
- fellowship.b1-b4: Original SPA hardcoded these in English, now properly translated
- fellowship.duration / preincubation.duration: Original hardcoded "6 months" / "12 weeks"
- footer.email / footer.location: Original hardcoded contact info
- Ensures complete translation coverage for all visible content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created component stubs to unblock TypeScript checks**
- **Found during:** Task 2 (Attempting to commit page.tsx)
- **Issue:** Pre-commit hook runs `tsc --noEmit` which fails on missing imports. Plan intended for components to be created in Plans 02-02/02-03, but TypeScript check blocked commit.
- **Fix:** Created 11 stub component files (AnnouncementBanner.tsx through Footer.tsx) each exporting a null-returning function
- **Files created:** src/app/[locale]/_components/{AnnouncementBanner,Navbar,Hero,TractionBar,Houses,Programs,Events,Community,Partners,IntentCTA,Footer}.tsx
- **Verification:** `bunx tsc --noEmit` passes, `bun run check` passes
- **Committed in:** 24463a9 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Biome formatting in tsconfig.json and globals.css**
- **Found during:** Task 1 (Running bun run check after adding font-mono-accent)
- **Issue:** tsconfig.json had inconsistent spacing, globals.css font-family line exceeded line length
- **Fix:** Ran `bunx biome check --write` to apply auto-formatting
- **Files modified:** tsconfig.json, src/styles/globals.css
- **Verification:** `bun run check` passes with zero errors
- **Committed in:** b10fcbc (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Component stubs were necessary to unblock development - they maintain type safety without changing implementation strategy. Formatting fixes required for CI compliance. No scope creep.

## Issues Encountered
None - plan executed smoothly with only expected auto-fixes for formatting and type checking.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Translation infrastructure complete and ready for component implementation
- All 64+ translation keys available in both Spanish and English
- Component stubs provide TypeScript safety during incremental implementation
- Plans 02-02 and 02-03 can now implement section components with full type safety
- Image assets and icon library ready for use

**Ready for:** Plan 02-02 (Navigation and Hero sections)

---
*Phase: 02-static-content-migration*
*Completed: 2026-02-09*

## Self-Check: PASSED

All claimed files exist and all commits verified.
