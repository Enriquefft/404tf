---
phase: 03-interactive-components
plan: 02
subsystem: animations
tags: [framer-motion, react-countup, scroll-animations, traction-bar, hero]
requires: [03-01]
provides:
  - scroll-triggered-animations
  - count-up-stats
  - floating-mascot
  - fade-in-sections
affects: [03-03]
tech-stack:
  added: []
  patterns:
    - framer-motion whileInView for scroll-triggered animations
    - react-countup enableScrollSpy for scroll-triggered counters
    - viewport.once: true for single-fire animations
    - Client Components as children of Server Components
key-files:
  created:
    - src/app/[locale]/_components/animations/FadeInSection.tsx
    - src/app/[locale]/_components/animations/FloatingMascot.tsx
  modified:
    - src/app/[locale]/_components/TractionBar.tsx
    - src/app/[locale]/_components/Hero.tsx
    - src/app/[locale]/page.tsx
decisions:
  - id: scroll-spy-countup
    choice: Use react-countup enableScrollSpy instead of intersection observer
    rationale: Built-in scroll spy reduces need for custom intersection logic
  - id: viewport-margin-trigger
    choice: Use margin: "-80px" on FadeInSection viewport
    rationale: Triggers animation slightly before element enters viewport for smoother UX
  - id: animation-budget-tracking
    choice: Track total animated elements (11/15 used)
    rationale: Prevents animation overload that degrades performance
  - id: hero-server-component-pattern
    choice: Keep Hero as Server Component with Client Component child
    rationale: Server Components can render Client Components as children, no need to convert Hero
metrics:
  duration: 2.9m
  completed: 2026-02-09
---

# Phase 3 Plan 2: TractionBar Count-Up and Scroll Animations Summary

**One-liner:** Count-up animations on TractionBar stats, floating mascot in Hero, and scroll-triggered fade-ins on 6 content sections using Framer Motion + react-countup.

## Performance

**Duration:** 2.9 minutes
**Tasks:** 2/2 completed
**Commits:** 2 atomic commits
**Files modified:** 5 (2 created, 3 modified)

**Velocity Notes:**
- Animation wrapper creation: ~1 minute (straightforward Framer Motion components)
- Integration across 3 components: ~2 minutes (type-safe prop passing, scroll spy setup)
- Zero build errors or hydration issues

## Accomplishments

### Task 1: Animation Wrapper Components
Created two reusable animation wrappers using Framer Motion:

**FadeInSection:**
- Scroll-triggered fade-in with slide-up (y: 40 → 0)
- `whileInView` prop with `viewport.once: true` ensures single-fire behavior
- `margin: "-80px"` triggers animation slightly before viewport entry
- 0.6s duration with easeOut for smooth reveal

**FloatingMascot:**
- Infinite y-axis floating animation (0 → -20 → 0)
- 3s duration with easeInOut for natural movement
- Uses `repeat: Infinity` for continuous loop

Both components are Client Components ("use client") and accept children as React.ReactNode.

### Task 2: Animation Integration
Integrated animations across landing page:

**TractionBar (converted to Client Component):**
- Removed `async` and `getTranslations` call (now receives translations as props)
- Changed stats from string values ("400+") to numeric (400, suffix: "+")
- Replaced static values with `<CountUp>` components:
  - `enableScrollSpy` triggers count-up when scrolled into view
  - `scrollSpyOnce` ensures animation fires only once
  - `duration={2}` for 2-second count-up
- 4 animated counters: 400+, 250+, 92+, 15

**Hero (remains Server Component):**
- Imported `FloatingMascot` wrapper
- Wrapped mascot `<Image>` with `<FloatingMascot>` tags
- Server Component successfully renders Client Component child (Next.js pattern)

**page.tsx (Server Component orchestration):**
- Imported `FadeInSection` wrapper
- Added `tractionT` translation call for TractionBar props
- Wrapped 6 content sections in `<FadeInSection>`:
  - TractionBar (with translations prop)
  - Houses
  - Programs
  - Events
  - Community
  - Partners
- **Not wrapped:** Hero (immediately visible), Footer (at bottom), IntentCTA (Plan 03-03 handles that)
- Biome auto-fixed import order (alphabetical)

**Animation Budget:**
- TractionBar: 4 counters
- Hero: 1 floating mascot
- Content sections: 6 fade-ins
- **Total: 11 animated elements** (within 15 budget)

## Task Commits

| Task | Commit | Summary |
|------|--------|---------|
| 1 | fb098ee | Create FadeInSection and FloatingMascot animation wrappers |
| 2 | 4eabba6 | Convert TractionBar to Client Component, add FloatingMascot to Hero, wrap sections in FadeInSection |

## Files Created/Modified

**Created:**
- `src/app/[locale]/_components/animations/FadeInSection.tsx` — Scroll-triggered fade-in wrapper
- `src/app/[locale]/_components/animations/FloatingMascot.tsx` — Infinite floating animation wrapper

**Modified:**
- `src/app/[locale]/_components/TractionBar.tsx` — Client Component with CountUp animations
- `src/app/[locale]/_components/Hero.tsx` — Server Component with FloatingMascot child
- `src/app/[locale]/page.tsx` — FadeInSection wrappers + TractionBar props

## Decisions Made

### scroll-spy-countup
**Decision:** Use react-countup's `enableScrollSpy` instead of custom intersection observer logic.
**Rationale:** react-countup has built-in scroll detection, reducing need for manual useIntersectionObserver hook. Simplifies code and maintains animation consistency.
**Impact:** TractionBar animations work out-of-the-box with zero custom observer code.

### viewport-margin-trigger
**Decision:** Use `margin: "-80px"` on FadeInSection's viewport prop.
**Rationale:** Triggering animation 80px before element enters viewport creates smoother UX (user sees animation start before element fully visible).
**Impact:** Progressive reveal feels more natural than waiting for full visibility.

### animation-budget-tracking
**Decision:** Track total animated elements (11/15 budget used in this plan).
**Rationale:** Too many animations degrade performance and create visual noise. Budget enforces intentional animation use.
**Impact:** Plan 03-03 has 4 animation slots remaining for IntentCTA section.

### hero-server-component-pattern
**Decision:** Keep Hero as Server Component and render FloatingMascot as Client Component child.
**Rationale:** Next.js App Router allows Server Components to render Client Components as children. No need to convert entire Hero to "use client" just for mascot animation.
**Impact:** Hero translations remain server-side (optimal), only mascot animation is client-side.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

### Import Order (Biome)
**Issue:** Biome's organizeImports rule flagged incorrect import order in page.tsx after adding FadeInSection import.
**Resolution:** Ran `bunx biome check --fix` to auto-sort imports alphabetically.
**Impact:** Zero friction — Biome fixed it automatically.

## Next Phase Readiness

**Ready for Plan 03-03:**
- Animation infrastructure complete (FadeInSection, FloatingMascot)
- Animation budget: 4 slots remaining (11/15 used)
- TractionBar, Hero, and content sections now have animations
- Next: IntentCTA interactive form + remaining animations

**No blockers.**

**Tech debt:** None

**Validation needed:** Visual verification of animations in dev server (smooth motion, no jank).

## Self-Check: PASSED

All created files exist:
- src/app/[locale]/_components/animations/FadeInSection.tsx ✓
- src/app/[locale]/_components/animations/FloatingMascot.tsx ✓

All commits exist:
- fb098ee ✓
- 4eabba6 ✓
