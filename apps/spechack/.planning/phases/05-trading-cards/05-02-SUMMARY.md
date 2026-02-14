---
phase: 05-trading-cards
plan: 02
subsystem: card-visual-component
tags: [client-component, framer-motion, trading-card, visual-design]
dependency_graph:
  requires: [card-utils.ts CardData type, getCountryFlag function]
  provides: [TradingCard component for use in CardReveal and TradingCardPreview]
  affects: [CardReveal (Phase 05-03), TradingCardPreview (Phase 05-04)]
tech_stack:
  added: []
  patterns:
    - Client component with locale prop instead of context
    - Named export instead of default (Next.js pattern)
    - No forwardRef needed in React 19
    - Translation prop-drilling for builder class description
key_files:
  created:
    - src/app/[locale]/_components/TradingCard.tsx
  modified: []
decisions:
  - decision: Remove forwardRef from blueprint component
    rationale: React 19 passes ref as regular prop; forwardRef wrapper not needed
    alternatives: [Keep forwardRef for compatibility]
    outcome: Cleaner component code, no ref handling needed
  - decision: Pass locale as prop instead of using useLang() context
    rationale: Follows project's translation prop-drilling pattern
    alternatives: [Use context for locale]
    outcome: Consistent with server-first architecture
  - decision: Named export instead of default export
    rationale: Project convention for all non-Next.js-special files
    alternatives: [Default export like blueprint]
    outcome: Consistent with project standards
metrics:
  duration: 3.5 min
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commits: 1
  completed_date: 2026-02-14
---

# Phase 5 Plan 2: TradingCard Component Summary

**One-liner:** Fully responsive trading card visual component with gradient background, agent identity, track badge, and builder class display.

## What Was Built

### 1. TradingCard Client Component
Created `TradingCard.tsx` as a `"use client"` component with pixel-identical visual to blueprint:

**Props:**
- `card: CardData` — Complete card data (agent number, name, city, track, builder class, gradient)
- `locale: "es" | "en"` — Language for builder class description
- `className?: string` — Optional additional styling

**Visual Elements:**
1. **Container** — `aspect-[3/4]` with gradient background (15% opacity overlay on dark base)
2. **Border** — Inner border with `border-white/10`
3. **Gradient accent line** — Horizontal line at top using card gradient colors
4. **SPECHACK branding** — Logo text in Orbitron font
5. **Agent number** — Large mono font in gradient `from` color
6. **Name** — XL Orbitron font, truncated if too long
7. **City + flag** — Small mono font with country flag emoji from `getCountryFlag()`
8. **Track badge** — Inline badge with conditional colors (virtual=cyan, hub=green)
9. **Separator line** — Horizontal divider
10. **Builder class name** — Bold Orbitron in gradient `to` color
11. **Builder class description** — Locale-aware description using `card.builderClass.desc[locale]`
12. **Event branding** — Footer with "404 SPECHACK · JUNE 19-28, 2026"

**Key Adaptations from Blueprint:**
- Removed `forwardRef` wrapper (not needed in React 19)
- Removed `useLang()` hook — replaced with `locale` prop
- Changed to named export `export function TradingCard`
- Uses project's `@/lib/card-utils` import path

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

**Build check:**
```
✓ bun run build — No errors, TypeScript compilation passed
✓ Static page generation successful (4/4 routes)
```

**Lint check:**
```
✓ bun run lint — Biome formatting/linting passed
```

**Component verification:**
```
✓ "use client" directive present
✓ Named export (export function TradingCard)
✓ No forwardRef usage
✓ No useLang() or context usage
✓ Imports CardData and getCountryFlag from @/lib/card-utils
✓ Accepts locale prop ("es" | "en")
✓ All visual elements present (agent number, name, city+flag, track badge, builder class, gradient, branding)
✓ Locale-aware builder class description using card.builderClass.desc[locale]
```

## Integration Points

### For Phase 05-03 (CardReveal)
- Import `TradingCard` from `@/app/[locale]/_components/TradingCard`
- Pass `CardData` object constructed from server action response
- Pass current locale from parent component
- Wrap with Framer Motion for reveal animation

### For Phase 05-04 (TradingCardPreview)
- Import `TradingCard` for fanned preview
- Create static `CardData` objects for preview cards
- Pass current locale from Hero server component
- Apply hover animations and rotation transforms

## Technical Notes

### Component Structure
- **Client component** — Requires `"use client"` for future animation integration
- **Fully responsive** — `aspect-[3/4]` maintains card shape at any container width
- **No state** — Pure presentational component
- **No effects** — No useEffect or other side effects

### Styling Approach
- **Inline styles** for gradient (dynamic values from CardData)
- **Tailwind classes** for layout and typography
- **Conditional inline styles** for track badge colors
- **Font classes** — `font-orbitron` for headings, `font-mono` for data

### Visual Fidelity
Component matches blueprint pixel-perfectly:
- Same Tailwind classes for all elements
- Same inline style patterns for gradients
- Same spacing (`space-y-3`, padding values)
- Same font sizes (`text-[10px]`, `text-xs`, `text-lg`, `text-xl`)
- Same color values for track badges

### Locale Handling
Builder class description displays in correct language:
```typescript
{card.builderClass.desc[locale]}
```
No runtime translation lookups — description already localized in CardData from server.

## Self-Check: PASSED

**Files created:**
```
FOUND: src/app/[locale]/_components/TradingCard.tsx
```

**Commits:**
```
FOUND: 4ac9de5 (feat(05-02): create TradingCard visual component)
```

**Verification commands:**
```bash
✓ grep '"use client"' src/app/[locale]/_components/TradingCard.tsx
✓ grep 'export function TradingCard' src/app/[locale]/_components/TradingCard.tsx
✓ grep 'import.*CardData.*from "@/lib/card-utils"' src/app/[locale]/_components/TradingCard.tsx
✓ grep 'import.*getCountryFlag.*from "@/lib/card-utils"' src/app/[locale]/_components/TradingCard.tsx
✓ grep 'card.builderClass.desc\[locale\]' src/app/[locale]/_components/TradingCard.tsx
✓ ! grep 'forwardRef' src/app/[locale]/_components/TradingCard.tsx
✓ ! grep 'useLang' src/app/[locale]/_components/TradingCard.tsx
```

All artifacts verified on disk and in git history.
