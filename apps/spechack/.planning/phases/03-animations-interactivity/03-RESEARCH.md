# Phase 3 Research: Animations & Interactivity

## Current State

### Existing Animation Infrastructure (Phase 1)
- `FadeInSection` — `whileInView` wrapper (opacity 0→1, y 40→0, 600ms, once)
- `MotionDiv`, `MotionSection`, `MotionSpan` — Generic motion wrappers accepting all HTMLMotionProps
- Barrel export at `_components/animations/index.ts`

### Existing Components (Phase 2)
- **page.tsx** — Composition root with 7 sections, no animation wrappers yet
- **Hero** — Server component, static content + presentational form
- **Manifesto** — Server component with phase cards grid
- **Judging** — Server component with static-width progress bars (`style={{ width: \`${pct}%\` }}`)
- **FAQ** — Server component using native `<details>/<summary>` with CSS `group-open:rotate-180` chevron
- **Hubs, Sponsors, Footer** — Server components, no animation needs beyond fade-in

### Blueprint Animation Patterns (from Vite prototype)
| Pattern | Approach | Duration |
|---------|----------|----------|
| Section reveals | `whileInView` fade-up | 600ms |
| Hero entrance | Staggered `animate` with delays | 200-1200ms |
| Progress bars | `whileInView` width 0→target% | 800ms + stagger |
| FAQ accordion | Radix + Tailwind keyframes (height 0→auto) | 200ms |
| Sticky button | IntersectionObserver + AnimatePresence | 200ms |
| Phase cards | Staggered `whileInView` | 600ms + i*0.15 |

## Key Design Decisions

### 1. FAQ Accordion Animation Strategy
**Problem:** Native `<details>/<summary>` doesn't animate height on close (content removed before animation).

**Options:**
- A) CSS `grid-template-rows: 0fr→1fr` — Works for open, not close
- B) `::details-content` pseudo — Chrome 131+ only, limited browser support
- C) Controlled client component with CSS grid animation — Full control, smooth both ways

**Decision: Option C** — Lightweight `AccordionItem` client component using React state + CSS `grid-template-rows` transition. Maintains accessibility (button + role), gains smooth height animation both open and close. FAQ component becomes a client component boundary.

### 2. Progress Bar Animation
**Problem:** Judging is a server component with static `style={{ width }}`.

**Approach:** Extract progress bars into a small `AnimatedProgressBar` client component that uses MotionDiv `whileInView` to animate width from 0 to target. Judging stays as server component, passes data down.

### 3. Hero Entrance Stagger
**Problem:** Hero is server component — can't use motion.* directly.

**Approach:** Wrap Hero content blocks in `FadeInSection` or `MotionDiv` wrappers. Since Hero is on initial viewport (no scroll trigger needed), use `MotionDiv` with `initial`/`animate` and staggered delays. Hero becomes partially client (wrapper component) or uses the existing motion wrappers.

Actually — simpler: wrap each child element in `MotionDiv` with initial/animate props directly in Hero. This requires Hero to become a client component OR we create a `StaggeredEntrance` wrapper. Best approach: keep Hero as server component, create a `HeroAnimations` client component that wraps the content with staggered fade-in.

### 4. Sticky Register Button
**Approach:** New `StickyRegisterButton` client component:
- IntersectionObserver watches `#register` section
- AnimatePresence for enter/exit animations
- Fixed position bottom-right
- Links to `#register`

## Component Architecture

```
page.tsx (server)
├── Navbar (client) — unchanged
├── FadeInSection wrapping each section
├── Hero (server) → HeroContent (client, staggered entrance)
├── Manifesto (server) → Phase cards wrapped in FadeInSection with stagger
├── Judging (server) → AnimatedProgressBar (client) for each bar
├── Hubs (server) — FadeInSection wrapper only
├── Sponsors (server) — FadeInSection wrapper only
├── FAQ → FAQAccordion (client) with AccordionItem
├── Footer (server) — FadeInSection wrapper only
└── StickyRegisterButton (client) — new, fixed position
```

## Translation Impact
- Need `stickyRegister` key in navbar or hero namespace for sticky button text
- No other translation changes needed (animations are visual-only)
