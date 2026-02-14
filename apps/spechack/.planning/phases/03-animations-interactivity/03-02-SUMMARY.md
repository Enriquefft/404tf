---
phase: 03-animations-interactivity
plan: 02
subsystem: landing-page
tags: [animations, interactions, accordion, progress-bars, framer-motion, css-transitions]

dependency_graph:
  requires:
    - "03-01 (FadeInSection wrapper for scroll-triggered reveals)"
  provides:
    - "AnimatedProgressBar (viewport-triggered progress bar animation)"
    - "AccordionItem (smooth CSS grid accordion with chevron rotation)"
  affects:
    - "Judging section (animated criteria bars)"
    - "FAQ section (smooth accordion transitions)"

tech_stack:
  added:
    - "CSS grid-template-rows transitions for accordion height animation"
    - "Framer Motion whileInView for progress bar animations"
  patterns:
    - "CSS-first animations (AccordionItem avoids Framer Motion for lighter bundle)"
    - "Viewport-triggered animations with once: true optimization"
    - "Staggered delays for sequential animations"

key_files:
  created:
    - path: "src/app/[locale]/_components/AnimatedProgressBar.tsx"
      lines: 27
      exports: ["AnimatedProgressBar"]
      purpose: "Client component for viewport-triggered progress bar width animation"
    - path: "src/app/[locale]/_components/AccordionItem.tsx"
      lines: 38
      exports: ["AccordionItem"]
      purpose: "Client component for smooth height-transitioning accordion with chevron rotation"
  modified:
    - path: "src/app/[locale]/_components/Judging.tsx"
      changes: "Replaced static progress bars with AnimatedProgressBar components"
    - path: "src/app/[locale]/_components/FAQ.tsx"
      changes: "Replaced native details/summary with AccordionItem components"

decisions:
  - id: "CSS grid accordion pattern"
    context: "Need smooth bidirectional height transitions for FAQ accordion"
    decision: "Use grid-template-rows: 0fr → 1fr transition instead of max-height"
    alternatives:
      - "max-height transition (requires hardcoded values, less smooth)"
      - "Framer Motion AnimatePresence (heavier bundle)"
    rationale: "grid-template-rows provides smooth transitions in both directions without knowing content height, lighter than Framer Motion"
    status: "✓ Good"

  - id: "Staggered progress bar timing"
    context: "5 progress bars animating simultaneously might feel chaotic"
    decision: "100ms stagger delay between bars (i * 0.1), 800ms fill duration"
    alternatives:
      - "All animate simultaneously (visually overwhelming)"
      - "Longer stagger (feels sluggish)"
    rationale: "Short stagger creates wave effect without feeling slow, easeOut gives satisfying deceleration"
    status: "✓ Good"

  - id: "Multiple FAQ items open simultaneously"
    context: "FAQ accordion behavior - single or multiple open?"
    decision: "Allow multiple items to be open at once (independent state)"
    alternatives:
      - "Accordion pattern (only one open, requires shared state)"
    rationale: "Users may want to compare answers, independent state is simpler"
    status: "✓ Good"

metrics:
  duration_seconds: 146
  duration_minutes: 2.4
  completed_date: "2026-02-14"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
  commits: 2
---

# Phase 3 Plan 2: Progress Bar & Accordion Animations Summary

**One-liner:** Viewport-triggered progress bar animations for Judging criteria and smooth CSS grid accordion transitions for FAQ items.

## Overview

Added two new client components to enhance the landing page with animations:
1. **AnimatedProgressBar** - Framer Motion component that animates progress bars from 0% to target width when entering viewport, with staggered timing for visual interest
2. **AccordionItem** - Pure CSS component using grid-template-rows transitions for smooth expand/collapse animations in both directions

Both components maintain the server-first architecture pattern by being integrated into existing server components (Judging and FAQ) as minimal client boundaries.

## Execution Summary

**Tasks Completed:** 2/2 ✓

| Task | Status | Commit | Description |
|------|--------|--------|-------------|
| 1. Create AnimatedProgressBar and update Judging | ✓ | 5f9600d | Viewport-triggered progress bar animation with stagger |
| 2. Create AccordionItem and update FAQ | ✓ | dc09d14 | CSS grid accordion with smooth height transitions |

**Duration:** 2.4 minutes (146 seconds)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Implementation

### AnimatedProgressBar Component

```tsx
<motion.div
  initial={{ width: 0 }}
  whileInView={{ width: `${pct}%` }}
  viewport={{ once: true }}
  transition={{ delay: 0.3 + delay, duration: 0.8, ease: "easeOut" }}
/>
```

**Key features:**
- Viewport-triggered animation (only fires once when scrolled into view)
- Base delay of 300ms + staggered delay (100ms per bar)
- 800ms fill duration with easeOut easing
- Animates from 0% to target percentage

**Integration:**
```tsx
{criteria.map(({ labelKey, pct }, i) => (
  <AnimatedProgressBar
    key={labelKey}
    label={t(labelKey)}
    pct={pct}
    delay={i * 0.1}
  />
))}
```

### AccordionItem Component

```tsx
<div
  className="grid transition-[grid-template-rows] duration-200 ease-out"
  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
>
  <div className="overflow-hidden">
    <div className="pb-4">{answer}</div>
  </div>
</div>
```

**Key features:**
- CSS grid-template-rows transition (0fr → 1fr) for smooth height animation
- Works in both directions (expand AND collapse are smooth)
- Chevron rotation via conditional className
- aria-expanded for accessibility
- No hardcoded height values needed
- Lighter than Framer Motion (pure CSS)

**Design pattern:**
- Outer div: grid with transition
- Middle div: overflow-hidden to clip content during transition
- Inner div: actual content with padding

## Requirements Satisfied

**Must-Haves:**
- [x] Judging progress bars animate from 0% to target width when section enters viewport
- [x] FAQ accordion items expand and collapse with smooth CSS height transitions
- [x] FAQ chevron icons rotate 180deg on open and back on close
- [x] Multiple FAQ items can be open simultaneously

**Success Criteria:**
- [x] SC4: Judging criteria progress bars animate from 0% to target value when section enters viewport
- [x] SC5: FAQ accordion items expand/collapse with smooth height transitions and rotate chevron icons
- [x] Build passes cleanly

## Artifacts Created

**AnimatedProgressBar.tsx:**
- Purpose: Viewport-triggered progress bar width animation
- Type: Client component (Framer Motion)
- Props: `{ label: string, pct: number, delay?: number }`
- Exports: `AnimatedProgressBar`

**AccordionItem.tsx:**
- Purpose: Smooth accordion with CSS grid transitions
- Type: Client component (React state)
- Props: `{ question: string, answer: string }`
- Exports: `AccordionItem`

## Impact on Codebase

**Before:**
- Static progress bars (instant 100% width)
- Native details/summary for FAQ (instant open/close)

**After:**
- Animated progress bars with staggered timing
- Smooth accordion transitions in both directions
- Enhanced visual polish and user experience

**Bundle size impact:**
- AnimatedProgressBar: Uses existing Framer Motion dependency (from FadeInSection)
- AccordionItem: Pure CSS transitions, no additional dependencies

## Key Learnings

1. **CSS grid for height transitions** - The `grid-template-rows: 0fr → 1fr` pattern provides smooth height transitions without knowing content height, superior to max-height hacks

2. **Staggered animations** - Small delays (100ms) between sequential animations create visual interest without feeling slow

3. **CSS-first when possible** - AccordionItem intentionally avoids Framer Motion to keep bundle size down, proving that not all animations need a library

4. **Viewport triggers** - `whileInView` with `once: true` is perfect for one-time reveal animations, avoids re-triggering on scroll

## Self-Check

Verifying all claimed artifacts exist:

```bash
# Check created files
[ -f "src/app/[locale]/_components/AnimatedProgressBar.tsx" ] && echo "FOUND: AnimatedProgressBar.tsx" || echo "MISSING"
[ -f "src/app/[locale]/_components/AccordionItem.tsx" ] && echo "FOUND: AccordionItem.tsx" || echo "MISSING"

# Check commits
git log --oneline --all | grep -q "5f9600d" && echo "FOUND: commit 5f9600d" || echo "MISSING"
git log --oneline --all | grep -q "dc09d14" && echo "FOUND: commit dc09d14" || echo "MISSING"
```

**Result:**
```
FOUND: AnimatedProgressBar.tsx
FOUND: AccordionItem.tsx
FOUND: commit 5f9600d
FOUND: commit dc09d14
```

## Self-Check: PASSED ✓
