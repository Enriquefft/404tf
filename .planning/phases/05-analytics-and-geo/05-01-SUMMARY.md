---
phase: 05-analytics-and-geo
plan: 01
subsystem: analytics
tags: [posthog, web-vitals, analytics, performance-monitoring]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js 16 App Router with TypeScript, Bun runtime, T3 Env validation
  - phase: 04-seo-metadata
    provides: Root layout structure
provides:
  - PostHog analytics integration with SSR-safe initialization
  - Manual pageview tracking for Next.js App Router
  - Core Web Vitals reporting to PostHog
  - Analytics modules with graceful degradation when env vars missing
affects: [05-02, future analytics features, performance monitoring]

# Tech tracking
tech-stack:
  added: [posthog-js]
  patterns:
    - Client Component provider pattern for analytics wrapping
    - SSR-safe module-level initialization with window checks
    - Manual pageview tracking with usePathname/useSearchParams
    - Suspense boundary requirement for useSearchParams hook
    - Graceful degradation when analytics env vars not configured

key-files:
  created:
    - src/lib/analytics/posthog-provider.tsx
    - src/lib/analytics/posthog-pageview.tsx
    - src/lib/analytics/web-vitals.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Use posthog-js SDK with manual pageview tracking (capture_pageview: false) for accurate App Router navigation"
  - "Initialize PostHog at module level outside component to prevent re-initialization on re-renders"
  - "Gracefully skip PostHog when env vars missing (return children unwrapped) for dev mode flexibility"
  - "Wrap PostHogPageView in Suspense boundary (Next.js requirement for useSearchParams)"
  - "Send Core Web Vitals to PostHog instead of separate analytics endpoint"

patterns-established:
  - "Module-level PostHog init with typeof window !== 'undefined' guard"
  - "Provider pattern checking env vars and conditionally wrapping vs rendering children directly"
  - "Suspense fallback={null} for pageview tracking component"
  - "useReportWebVitals callback sending to PostHog with metric name/value/id/rating"

# Metrics
duration: 2.7min
completed: 2026-02-13
---

# Phase 05 Plan 01: PostHog Analytics & Core Web Vitals Summary

**PostHog analytics with manual pageview tracking, Core Web Vitals reporting, and graceful degradation when unconfigured**

## Performance

- **Duration:** 2.7 min (162 seconds)
- **Started:** 2026-02-13T05:06:29Z
- **Completed:** 2026-02-13T05:09:11Z
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- PostHog SDK integrated with SSR-safe initialization and graceful fallback when env vars missing
- Manual pageview tracking for Next.js 16 App Router client-side navigation
- Core Web Vitals (LCP, INP, CLS) automatically reported to PostHog
- Build succeeds without Suspense boundary errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PostHog analytics modules** - `1517715` (feat)
2. **Task 2: Integrate analytics into root layout** - `1e4b6a1` (feat)

## Files Created/Modified

**Created:**
- `src/lib/analytics/posthog-provider.tsx` - PostHog React provider with module-level init, checks env vars and gracefully skips wrapping when missing
- `src/lib/analytics/posthog-pageview.tsx` - Manual pageview tracking component using usePathname/useSearchParams, captures $pageview events
- `src/lib/analytics/web-vitals.tsx` - Core Web Vitals reporter using useReportWebVitals hook, sends metrics to PostHog

**Modified:**
- `src/app/layout.tsx` - Wrapped body children with PHProvider, added Suspense-wrapped PostHogPageView and WebVitals components

## Decisions Made

**1. Manual pageview tracking with capture_pageview: false**
- Rationale: Next.js App Router requires manual tracking for accurate client-side navigation pageviews (automatic capture misses SPA navigations)
- Implementation: usePathname + useSearchParams hooks in PostHogPageView component

**2. Module-level PostHog initialization**
- Rationale: Prevents re-initialization on component re-renders which would lose session state
- Implementation: posthog.init() outside component body, guarded by `typeof window !== "undefined"`

**3. Graceful degradation when env vars missing**
- Rationale: Allows dev mode to work without PostHog credentials, prevents crashes
- Implementation: PHProvider checks env vars and returns unwrapped children when missing

**4. Suspense boundary for PostHogPageView**
- Rationale: Next.js requires Suspense for useSearchParams to prevent full-page client-side rendering bailout
- Implementation: `<Suspense fallback={null}><PostHogPageView /></Suspense>` in layout

**5. Send Web Vitals to PostHog instead of separate endpoint**
- Rationale: Consolidates all analytics in single platform, simplifies infrastructure
- Implementation: usePostHog hook in WebVitals component, capture "web_vitals" events with metric properties

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed research patterns, build succeeded on first attempt after auto-fixing Biome linting (import organization, template literal).

## User Setup Required

**External services require manual configuration.** PostHog analytics will be inactive until environment variables are set:

**Environment Variables Needed:**
- `NEXT_PUBLIC_POSTHOG_KEY` - Project API Key from PostHog Dashboard → Project Settings → Project API Key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog instance URL (usually https://us.i.posthog.com or https://eu.i.posthog.com)

**Graceful Degradation:**
Analytics modules detect missing env vars and skip initialization (no crashes). Dev server runs successfully without PostHog configured.

**Verification:**
After setting env vars, check PostHog dashboard for:
- Pageview events on navigation between /es and /en
- web_vitals events with LCP, INP, CLS metrics

## Next Phase Readiness

**Ready for Phase 05-02:**
- Analytics foundation complete (PostHog initialized, pageviews tracked, Core Web Vitals reported)
- Dev server confirmed running without errors
- Build succeeds with zero warnings
- Graceful degradation allows development without PostHog credentials

**No blockers for next plan** (llms.txt generation and error/loading states)

---
*Phase: 05-analytics-and-geo*
*Completed: 2026-02-13*

## Self-Check: PASSED

All created files exist:
- src/lib/analytics/posthog-provider.tsx ✓
- src/lib/analytics/posthog-pageview.tsx ✓
- src/lib/analytics/web-vitals.tsx ✓

All commits exist:
- 1517715 ✓
- 1e4b6a1 ✓
