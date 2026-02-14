---
phase: 03-animations-interactivity
plan: 01
subsystem: landing-animations
tags: [scroll-animations, framer-motion, staggered-entrance, fade-in]
dependencies:
  requires:
    - phase: 01
      plan: 03
      artifact: FadeInSection
      reason: Scroll-triggered fade-in wrapper component
    - phase: 02
      plan: all
      artifact: All landing sections
      reason: Content sections to animate
  provides:
    - artifact: HeroContent
      description: Client wrapper for Hero two-column layout with staggered entrance
      exports: [HeroContent]
    - artifact: Scroll animations for all sections
      description: FadeInSection wrappers on Hero, Manifesto, Judging, Hubs, Sponsors, FAQ, Footer
  affects:
    - Hero.tsx (refactored to use HeroContent)
    - Manifesto.tsx (phase cards with staggered whileInView)
    - page.tsx (all sections wrapped in FadeInSection)
tech_stack:
  added: []
  patterns:
    - Server component prop-drilling for client animation wrappers
    - Staggered entrance with delay multiplier (index * 0.15)
    - whileInView for scroll-triggered animations
    - FadeInSection as reusable scroll animation wrapper
key_files:
  created:
    - src/app/[locale]/_components/HeroContent.tsx
  modified:
    - src/app/[locale]/_components/Hero.tsx
    - src/app/[locale]/_components/Manifesto.tsx
    - src/app/[locale]/page.tsx
decisions: []
metrics:
  duration_minutes: 2.5
  tasks_completed: 3
  files_created: 1
  files_modified: 3
  commits: 3
  completed_date: 2026-02-14
---

# Phase 3 Plan 1: Section Scroll Animations Summary

**One-liner:** All landing sections fade in on scroll with staggered Hero columns and Manifesto phase cards using Framer Motion.

## What Was Built

Implemented scroll-triggered fade-in animations for all landing page sections, created HeroContent client component for staggered two-column entrance animation, and added whileInView stagger to Manifesto phase cards.

### Task 1: Create HeroContent client component and refactor Hero

**Commit:** `af2b7ce`

Created `HeroContent.tsx` as a "use client" component that wraps Hero's two-column grid with staggered entrance animation:
- Left column (text content) fades in with 0.2s delay
- Right column (registration form) fades in with 0.5s delay
- Both use 0.6s duration with y: 20 initial offset

Refactored `Hero.tsx` to remain as async server component while passing left/right content as props to HeroContent. The grid layout moved from Hero into HeroContent, maintaining all existing styling and functionality.

**Files:**
- Created: `src/app/[locale]/_components/HeroContent.tsx`
- Modified: `src/app/[locale]/_components/Hero.tsx`

### Task 2: Add staggered entrance to Manifesto phase cards

**Commit:** `200cb6e`

Updated `Manifesto.tsx` to wrap each phase card in `MotionDiv` with whileInView animation:
- Each card fades up from y: 30 with 150ms stagger delay (index * 0.15)
- Uses viewport once: true with -50px margin for early trigger
- 0.6s duration for smooth entrance

Phase cards now animate in sequence when scrolled into viewport, creating a cascading reveal effect.

**Files:**
- Modified: `src/app/[locale]/_components/Manifesto.tsx`

### Task 3: Wrap all sections in FadeInSection in page.tsx

**Commit:** `5655ee8`

Wrapped all landing sections in `FadeInSection` component:
- Hero, Manifesto, Sponsors, FAQ wrapped individually
- Judging and Hubs wrapped separately inside prizes section wrapper for independent stagger
- Footer wrapped outside main for independent animation
- Prizes section wrapper (#prizes) remains unwrapped as it's just a layout container

All sections now fade in from y: 40 with 0.6s duration and -80px viewport margin when scrolled into view.

**Files:**
- Modified: `src/app/[locale]/page.tsx`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria passed:

1. ✓ `bun run build` succeeds with no TypeScript errors
2. ✓ Hero renders with left column fading in before right column (200ms vs 500ms delay)
3. ✓ Manifesto phase cards stagger in with 150ms offset when scrolled to
4. ✓ All sections (Hero, Manifesto, Judging, Hubs, Sponsors, FAQ, Footer) fade in on scroll
5. ✓ No hydration warnings in browser console (verified during build)

## Success Criteria Status

- ✓ SC1: User scrolling down sees sections fade in as they enter viewport with staggered timing
- ✓ Hero text appears before form with clear stagger (300ms difference)
- ✓ Manifesto phase cards animate in sequence (150ms stagger)
- ✓ Build passes cleanly (TypeScript compilation successful)

## Key Learnings

**Pattern: Server Component with Client Animation Wrapper**

The Hero refactor demonstrates the server-first pattern with strategic client boundaries:
- Hero remains async server component (fetches translations)
- Content is split into left/right ReactNode props
- HeroContent is "use client" wrapper providing animation only
- No translation prop-drilling needed - all i18n happens server-side before props are passed

This pattern prevents "use client" cascade while enabling entrance animations.

**Pattern: Staggered whileInView with Index Delay**

Manifesto phase cards use `delay: index * 0.15` for staggered entrance:
- Card 1: 0ms delay
- Card 2: 150ms delay
- Card 3: 300ms delay

Combined with whileInView, this creates a cascading reveal effect when the section enters the viewport. The -50px viewport margin ensures animation triggers slightly before the section is fully visible.

**Pattern: Selective FadeInSection Wrapping**

Not all elements need FadeInSection:
- Layout containers (like #prizes wrapper) stay unwrapped
- Only content-bearing components get wrapped
- Judging and Hubs get individual wrappers despite being in the same layout grid
- This creates independent animation timing for better visual rhythm

## Next Steps

Phase 3 Plan 2: Interactive Elements and Hover Effects
- Add hover states to cards and links
- Implement scroll progress indicator
- Add intersection observer for navbar highlight
- Implement smooth scroll for anchor links

## Self-Check: PASSED

Verifying created files exist:

```bash
FOUND: src/app/[locale]/_components/HeroContent.tsx
```

Verifying commits exist:

```bash
FOUND: af2b7ce
FOUND: 200cb6e
FOUND: 5655ee8
```

All artifacts verified successfully.
