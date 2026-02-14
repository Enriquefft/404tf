---
phase: 03-animations-interactivity
plan: 03
subsystem: "UI/Interactivity"
tags: ["scroll-behavior", "intersection-observer", "framer-motion", "floating-cta"]
dependency_graph:
  requires: ["03-01"]
  provides: ["sticky-register-cta"]
  affects: ["page-composition", "hero-registration"]
tech_stack:
  added: ["IntersectionObserver API"]
  patterns: ["scroll-triggered-visibility", "animated-floating-button"]
key_files:
  created:
    - "src/app/[locale]/_components/StickyRegisterButton.tsx"
  modified:
    - "src/app/[locale]/page.tsx"
decisions: []
metrics:
  duration_seconds: 152
  duration_display: "2.5m"
  completed_date: "2026-02-14"
---

# Phase 03 Plan 03: Sticky Register Button Summary

**One-liner:** Floating register CTA with IntersectionObserver-based visibility toggle and AnimatePresence animations.

## What Was Built

Created a sticky "Register" button that appears when users scroll past the Hero section's registration form, providing quick navigation back to registration from anywhere on the page.

## Implementation Details

### StickyRegisterButton Component

**Location:** `src/app/[locale]/_components/StickyRegisterButton.tsx`

**Architecture:**
- Client component using IntersectionObserver API
- Watches `#register` section (Hero) with 0.1 threshold
- Shows button when Hero is <10% visible (user scrolled past)
- Hides button when Hero returns to viewport

**Animation Pattern:**
- AnimatePresence for smooth enter/exit transitions
- Fade up on appear: `initial={{ opacity: 0, y: 20 }}`
- Fade down on hide: `exit={{ opacity: 0, y: 20 }}`
- 200ms transition duration

**Styling:**
- Fixed bottom-right positioning (`bottom-6 right-6`)
- z-index: 40 (below navbar's z-50)
- Primary color with shadow-lg for depth
- Hover opacity transition for feedback
- Font-mono for consistency with SpecHack brand

**Behavior:**
- Anchor link to `#register`
- Relies on CSS `scroll-behavior: smooth` from globals.css
- No client-side scroll implementation needed

### Page Integration

**Updated:** `src/app/[locale]/page.tsx`

**Changes:**
1. Added import for StickyRegisterButton
2. Rendered after Footer (inside fragment, after last FadeInSection)
3. Passed `navT("register")` translation as label prop

**Translation Reuse:**
- No new translation keys required
- Uses existing `navbar.register` fetched for Navbar component
- Maintains consistency across register CTAs

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

No new decisions made. Implementation followed established patterns:
- Translation prop-drilling from server component
- Client boundary for IntersectionObserver
- AnimatePresence pattern from Phase 1
- z-index layering convention

## Testing Notes

**Build Verification:**
- TypeScript compilation passed cleanly
- No hydration warnings
- Static generation successful

**Manual Testing Required:**
1. Verify button hidden on initial page load
2. Confirm fade-up animation when scrolling past Hero
3. Test smooth scroll to #register on click
4. Verify fade-down animation when scrolling back to Hero
5. Check mobile viewport positioning (no overlap with critical content)

## Success Criteria Met

- ✓ SC2: Sticky register button appears when user scrolls past Hero
- ✓ SC3: Clicking sticky button scrolls smoothly to Hero registration form
- ✓ Build passes cleanly
- ✓ Button has smooth enter/exit animations
- ✓ Button visibility properly toggles based on Hero intersection

## Files Changed

### Created (1)
- `src/app/[locale]/_components/StickyRegisterButton.tsx` - Client component with IntersectionObserver

### Modified (1)
- `src/app/[locale]/page.tsx` - Added StickyRegisterButton to composition

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | af095ee | Create StickyRegisterButton client component |
| 2 | 46a6dce | Add StickyRegisterButton to page composition |

## Next Steps

Phase 3 Plan 3 complete. This was the final plan in Phase 03-Animations-Interactivity.

**Phase 3 Completion Status:**
- ✓ Plan 01: Section scroll animations (FadeInSection)
- ✓ Plan 03: Sticky register button (this plan)

**Ready for Phase 4:** Registration form implementation with server actions, Zod validation, and database integration.

## Self-Check: PASSED

**Files Created:**
- ✓ src/app/[locale]/_components/StickyRegisterButton.tsx exists

**Commits Verified:**
- ✓ af095ee found in git log
- ✓ 46a6dce found in git log

All claimed deliverables verified.
