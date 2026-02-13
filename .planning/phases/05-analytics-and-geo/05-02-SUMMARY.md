---
phase: 05-analytics-and-geo
plan: 02
subsystem: discovery
tags: [llms-txt, seo, ai-discoverability, error-handling, i18n, next-intl]

# Dependency graph
requires:
  - phase: 04-seo-and-metadata
    provides: seo-config.ts with SITE_URL, CONTACT_EMAIL, SOCIAL_LINKS
  - phase: 01-foundation
    provides: next-intl configuration and translation infrastructure
provides:
  - llms.txt and llms-full.txt for AI system discoverability
  - Internationalized 404 page with catch-all route
  - Error boundary with retry functionality
  - Loading state with spinner
  - Production-ready error handling states
affects: [future-phases-needing-error-patterns, ai-discovery-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "llms-txt standard for AI discoverability"
    - "Catch-all [...rest] route pattern for 404 detection"
    - "Client Component error boundaries with useTranslations"
    - "Single source of truth for llms.txt content from seo-config and translations"

key-files:
  created:
    - public/llms.txt
    - public/llms-full.txt
    - src/app/[locale]/not-found.tsx
    - src/app/[locale]/error.tsx
    - src/app/[locale]/loading.tsx
    - src/app/[locale]/[...rest]/page.tsx
  modified:
    - messages/en.json
    - messages/es.json

key-decisions:
  - "Created llms.txt (1.3KB) and llms-full.txt (8.5KB) following llms-txt-standard format"
  - "Used single source of truth pattern - derived all content from seo-config.ts and translation files"
  - "Renamed error.tsx export to ErrorBoundary to avoid noShadowRestrictedNames Biome warning"
  - "Added SVG title and aria-label for accessibility in error icon"
  - "Used catch-all [...rest] route to trigger notFound() for unknown paths"

patterns-established:
  - "llms-txt pattern: H1 → blockquote summary → H2 sections with key info"
  - "Production error states: all localized with cyberpunk purple theme consistency"
  - "Error boundary pattern: useEffect for logging, retry button, proper TypeScript types"
  - "Loading pattern: sr-only text for accessibility, purple spinner for visual consistency"

# Metrics
duration: 3.6min
completed: 2026-02-13
---

# Phase 05 Plan 02: AI Discoverability & Production States Summary

**llms.txt files for AI systems and production-ready error/404/loading states with bilingual support**

## Performance

- **Duration:** 3.6 min
- **Started:** 2026-02-13T05:08:37Z
- **Completed:** 2026-02-13T05:12:15Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created llms.txt (1.3KB) and llms-full.txt (8.5KB) following llms-txt-standard format for AI discoverability
- Implemented bilingual 404 page with purple glow effect and catch-all route
- Built error boundary with retry functionality and error logging
- Added loading spinner with accessibility support
- All production states styled with consistent cyberpunk purple theme

## Task Commits

Each task was committed atomically:

1. **Task 1: Create llms.txt and llms-full.txt static files** - `df9e1ba` (docs)
2. **Task 2: Create internationalized error, loading, and 404 pages** - `173d14d` (feat)

## Files Created/Modified
- `public/llms.txt` - Concise AI discoverability summary (1.3KB) with H1, blockquote, H2 sections
- `public/llms-full.txt` - Extended AI discoverability content (8.5KB) with programs, events, houses, FAQ, contact
- `src/app/[locale]/not-found.tsx` - Bilingual 404 page with purple glow 404 number and link home
- `src/app/[locale]/error.tsx` - Client Component error boundary with retry button and console logging
- `src/app/[locale]/loading.tsx` - Loading spinner with sr-only accessibility text
- `src/app/[locale]/[...rest]/page.tsx` - Catch-all route triggering notFound() for unknown paths
- `messages/en.json` - Added NotFound, Error, Loading translation keys
- `messages/es.json` - Added NotFound, Error, Loading translation keys

## Decisions Made

**llms.txt content strategy:**
- Derived all content from existing seo-config.ts and translation files (single source of truth)
- llms.txt: 1.3KB concise summary with About, Programs, Events, Houses, Contact
- llms-full.txt: 8.5KB extended content with expanded sections, FAQ, Community, Partners, Technical details

**Error boundary naming:**
- Renamed component export to `ErrorBoundary` instead of `Error` to avoid Biome noShadowRestrictedNames warning
- Maintains Next.js convention (file named error.tsx) while avoiding global name collision

**Accessibility:**
- Added `<title>Error</title>` and `aria-label` to error icon SVG for screen readers
- Used sr-only "Loading..." text in loading spinner
- Proper semantic HTML with h1/h2 hierarchy

**Styling consistency:**
- All production states use cyberpunk purple theme (--purple-500, gradient from purple to pink)
- 404 number has purple glow effect matching site branding
- Consistent layout: centered, max-w-2xl, dark background

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Biome lint errors on first attempt:**
- noShadowRestrictedNames: Function named `Error` shadowed global - renamed to `ErrorBoundary`
- noSvgWithoutTitle: SVG missing title element - added `<title>Error</title>` and aria-label
- Format errors: Multi-line JSX for h2/p tags - reformatted to single line
- organizeImports: Wrong import order - moved Link before next-intl

All fixed and verified with `bun run check` before commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

✅ **AI Discoverability Complete:**
- llms.txt files available at /llms.txt and /llms-full.txt
- Both files under size limits (1.3KB and 8.5KB respectively)
- Content follows llms-txt-standard format
- Single source of truth from seo-config and translations ensures accuracy

✅ **Production Error Handling Complete:**
- 404 page handles unknown routes with localized messages
- Error boundary catches runtime errors with retry functionality
- Loading state provides visual feedback during page transitions
- All states fully bilingual (ES/EN)
- Consistent purple cyberpunk theme across all error states

**Ready for:** Phase 5 Plan 1 (PostHog + Core Web Vitals) can be executed in parallel or sequentially - no dependencies between 05-01 and 05-02.

**No blockers** for project completion.

## Self-Check: PASSED

All created files verified:
- ✓ public/llms.txt
- ✓ public/llms-full.txt
- ✓ src/app/[locale]/not-found.tsx
- ✓ src/app/[locale]/error.tsx
- ✓ src/app/[locale]/loading.tsx
- ✓ src/app/[locale]/[...rest]/page.tsx

All commits verified:
- ✓ df9e1ba (Task 1)
- ✓ 173d14d (Task 2)

---
*Phase: 05-analytics-and-geo*
*Completed: 2026-02-13*
