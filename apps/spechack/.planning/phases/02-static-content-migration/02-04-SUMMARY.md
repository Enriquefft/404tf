---
phase: 02-static-content-migration
plan: 04
subsystem: ui
tags: [next-intl, server-components, faq, footer, page-composition]

# Dependency graph
requires:
  - phase: 02-static-content-migration
    provides: Navbar, Hero, Manifesto, Judging, Hubs, Sponsors components
  - phase: 01-foundation
    provides: Next.js 16 app with next-intl routing and Tailwind v4 theme
provides:
  - FAQ accordion section with native details/summary elements
  - Footer with branding, navigation links, social links, and contact
  - Complete page composition wiring all 7 sections + Navbar + Footer
  - Full landing page rendering in both ES and EN locales
affects: [03-animations-interactivity, 04-forms-database, 07-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native HTML details/summary for FAQ accordion (no shadcn dependency)"
    - "page.tsx as server component composition root with translation prop-drilling"
    - "Two-column section wrapper in page.tsx for Judging+Hubs grid layout"

key-files:
  created:
    - src/app/[locale]/_components/FAQ.tsx
    - src/app/[locale]/_components/Footer.tsx
  modified:
    - src/app/[locale]/page.tsx
    - src/styles/globals.css
    - src/app/[locale]/_components/Manifesto.tsx

key-decisions:
  - "Native details/summary for FAQ (no shadcn Accordion dependency)"
  - "page.tsx as composition root with Judging+Hubs two-column wrapper"
  - "t.raw() for ICU-incompatible {bold} markers in manifesto translations"

patterns-established:
  - "page.tsx fetches navbar translations, passes as props to client component"
  - "Section-level server components use id attributes for anchor navigation"
  - "CSS summary marker hiding for native details styling"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 2 Plan 4: FAQ, Footer, and Page Composition Summary

**FAQ accordion with native details/summary, Footer with branding and links, full page composition wiring 7 sections + Navbar**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-14T00:05:00Z
- **Completed:** 2026-02-14T00:09:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 5

## Accomplishments
- FAQ section with 4 expandable items using native HTML details/summary elements
- Footer with SpecHack branding, navigation links, social links, and contact email
- Complete page composition in page.tsx wiring all 7 sections in correct order
- Full landing page rendering successfully in both /es/ and /en/ routes
- Human verification confirmed visual and functional correctness

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FAQ and Footer server components** - `d12a4f3` (feat)
2. **Task 2: Compose all sections in page.tsx** - `3e30db1` (feat)
3. **Orchestrator fix: t.raw() for manifesto bold markers** - `1181c93` (fix)

**Plan metadata:** (to be created in this commit)

## Files Created/Modified
- `src/app/[locale]/_components/FAQ.tsx` - Async server component with native details/summary accordion (4 FAQ items)
- `src/app/[locale]/_components/Footer.tsx` - Async server component with branding, nav links, social links, contact
- `src/app/[locale]/page.tsx` - Complete page composition root importing all 7 sections + Navbar + Footer
- `src/styles/globals.css` - Added CSS rules to hide default details marker
- `src/app/[locale]/_components/Manifesto.tsx` - Fixed t.raw() for {bold} markers incompatible with ICU parser

## Decisions Made

**1. Native details/summary for FAQ accordion**
- Rationale: Avoids shadcn dependency, works without JavaScript, simpler implementation
- Impact: FAQ accordion is fully accessible and progressively enhanced
- Pattern: Use native HTML elements when they provide required functionality

**2. page.tsx as composition root with Judging+Hubs wrapper**
- Rationale: page.tsx provides the parent `<section id="prizes">` wrapper for the two-column grid layout shared by Judging and Hubs components
- Impact: Clean separation of concerns - page.tsx handles layout, child components handle content
- Pattern: Parent composition provides shared wrappers for multi-component sections

**3. t.raw() for manifesto {bold} markers**
- Rationale: next-intl ICU parser treated `{bold}` as ICU message arguments, causing runtime errors
- Impact: Manifesto section renders correctly with bold text styling
- Pattern: Use t.raw() for translation strings with custom markers that aren't ICU syntax

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed t.raw() for manifesto {bold} markers**
- **Found during:** Task 3 (Visual verification checkpoint)
- **Issue:** Manifesto component used `t("principle0")` which triggered next-intl ICU parser to treat `{bold}` as message arguments, causing runtime error: "MISSING_ARGUMENT: The intl string context variable 'bold' was not provided"
- **Fix:** Changed all manifesto translation calls from `t("key")` to `t.raw("key")` to bypass ICU parser and return raw string with markers intact
- **Files modified:** `src/app/[locale]/_components/Manifesto.tsx`
- **Verification:** Manifesto renders correctly with bold styling, no runtime errors
- **Committed in:** `1181c93` (orchestrator fix during checkpoint)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix was necessary for correctness. The `{bold}` marker pattern established in plan 02-01 was incompatible with next-intl's ICU parser by default. Using `t.raw()` preserves the pattern while avoiding parser conflicts. No scope creep.

## Issues Encountered

None during planned work. The only issue was the ICU parser conflict discovered during verification (documented as deviation above).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 3 (Animations & Interactivity):**
- All 7 sections rendered and verified
- Scroll-aware Navbar ready for animation enhancements
- FAQ accordion ready for smooth height transitions
- Page structure supports scroll-triggered fade-in animations

**Phase 2 Complete:**
All LAND requirements satisfied:
- LAND-01: Bilingual routing ✓
- LAND-02: Navbar with scroll behavior ✓
- LAND-03: Mobile hamburger menu ✓
- LAND-04: Hero with registration form placeholder ✓
- LAND-05: Manifesto section ✓
- LAND-06: Judging criteria ✓
- LAND-07: Hubs section ✓
- LAND-08: FAQ accordion ✓
- LAND-09: Sponsors section ✓
- LAND-11: Footer ✓

**No blockers.**

---
*Phase: 02-static-content-migration*
*Completed: 2026-02-14*

## Self-Check: PASSED

All files verified:
- FAQ.tsx ✓
- Footer.tsx ✓

All commits verified:
- d12a4f3 ✓
- 3e30db1 ✓
- 1181c93 ✓
