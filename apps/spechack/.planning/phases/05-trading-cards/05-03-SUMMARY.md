---
phase: 05-trading-cards
plan: 03
subsystem: card-reveal-integration
tags: [client-component, framer-motion, localStorage, social-sharing, registration-flow]
dependency_graph:
  requires: [CardReveal component, TradingCard component, card-utils.client.ts, share-utils.ts]
  provides: [Complete post-registration flow with card reveal and sharing]
  affects: [Hero (passes translations), Future challenge pages (Phase 06)]
tech_stack:
  added: []
  patterns:
    - localStorage persistence for returning users
    - Controlled form state for city preservation
    - Translation prop-drilling from server to nested client components
    - Conditional rendering based on localStorage + server state
    - AnimatePresence for expandable share panel
key_files:
  created:
    - src/app/[locale]/_components/CardReveal.tsx
  modified:
    - src/app/[locale]/_components/RegistrationForm.tsx
    - src/app/[locale]/_components/Hero.tsx
decisions:
  - decision: Controlled city input state in RegistrationForm
    rationale: Preserve city value after form submission for CardData construction
    alternatives: [Re-extract from FormData, use hidden input]
    outcome: Clean state management, value available immediately after submission
  - decision: localStorage check on mount with useEffect
    rationale: Returning users see their card without re-registering
    alternatives: [Session storage, cookies, server-side session]
    outcome: Client-side persistence, no server round-trip needed
  - decision: Construct challenge link in event handlers (not at render time)
    rationale: Avoids SSR/hydration issues with window.location.origin
    alternatives: [Pass origin as prop, use useEffect to set state]
    outcome: No SSR errors, window access only when user clicks
metrics:
  duration: 6.6 min
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  commits: 2
  completed_date: 2026-02-14
---

# Phase 5 Plan 3: Card Reveal & Integration Summary

**One-liner:** Animated post-registration card reveal with download, social sharing, and challenge link functionality, integrated into RegistrationForm with localStorage persistence.

## What Was Built

### 1. CardReveal Component (New)
Created `CardReveal.tsx` as a client component with complete post-registration flow:

**Visual Elements:**
- **Outer motion.div** — Fade in container (opacity 0 → 1)
- **Card reveal animation** — `motion.div` with combined transforms:
  - Initial: `opacity: 0, scale: 0.8, rotateY: -15`
  - Animate: `opacity: 1, scale: 1, rotateY: 0`
  - Transition: 800ms easeOut
  - Contains `<TradingCard>` at `w-[200px] sm:w-[240px]`
- **Action buttons** — Staggered entrance (delay 0.6s):
  - Download Card (triggers Canvas PNG export via `downloadCard()`)
  - Share on X (opens Twitter intent with pre-filled tweet)
  - Challenge a Friend (toggles expandable share panel, primary styled)
- **Share panel** — `AnimatePresence` with height animation:
  - "Want to recruit more?" prompt
  - Copy link button (clipboard API, shows checkmark for 2s)
  - WhatsApp button (opens WhatsApp share)
  - LinkedIn button (opens LinkedIn share-offsite)

**Props & State:**
- Props: `card: CardData`, `locale: "es" | "en"`, `translations` object
- State: `copied` (boolean), `showShare` (boolean)
- Uses translation props (no context hooks)
- Browser API calls (window, navigator.clipboard) only in event handlers

**Key Adaptations from Blueprint:**
- No `useLang()` — uses `locale` prop
- No `t.*` imports — uses `translations` prop
- Named export `export function CardReveal`
- Challenge link built in event handlers using `window.location.origin` (not at render time)
- Tweet text construction from template with placeholders: `{agent}`, `{cls}`, `{link}`

### 2. RegistrationForm Integration (Modified)
Updated `RegistrationForm.tsx` with four major changes:

**A. Controlled City State**
- Added `const [city, setCity] = useState("")`
- Made city input controlled: `value={city} onChange={(e) => setCity(e.target.value)}`
- Preserves city value after form submission for CardData construction

**B. localStorage Check on Mount**
- Added `const [savedCard, setSavedCard] = useState<CardData | null>(null)`
- Added `useEffect` to load saved card:
  ```typescript
  useEffect(() => {
    const loaded = loadCardFromStorage();
    if (loaded) setSavedCard(loaded);
  }, []);
  ```
- Renders CardReveal for returning users before form

**C. Success State Replacement**
- Replaced success message div with CardReveal component
- Constructs `CardData` from:
  - `state.data` (agentNumber, name, builderClass, gradientData from server)
  - Local state (`city`, `track` from form)
- Calls `saveCardToStorage(cardData)` on success
- Added null check: `if (state?.success && state.data)`

**D. Props Extension**
- Extended `RegistrationFormProps` with `cardTranslations` object
- Imports: `CardData`, `loadCardFromStorage`, `saveCardToStorage`, `CardReveal`

### 3. Hero Translation Pass-Through (Modified)
Updated `Hero.tsx` to pass card translations:
- Added `const cardT = await getTranslations("cards")`
- Passed `cardTranslations` prop to `<RegistrationForm>` with 8 translation keys:
  - download, shareX, challenge
  - challengeCopy, challengeWhatsApp, challengeLinkedIn
  - recruitMore, tweetTemplate

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

**Build check:**
```
✓ bun run build — No errors, TypeScript compilation passed
✓ Static page generation successful (4/4 routes)
✓ No SSR errors from window/navigator access
```

**Lint check:**
```
✓ bun run lint — Biome formatting/linting passed
```

**Component verification:**
```
✓ CardReveal.tsx has "use client" directive
✓ CardReveal has named export (export function CardReveal)
✓ CardReveal imports TradingCard, downloadCard, share utils
✓ CardReveal uses translation props (no context)
✓ No window access at render time (only in event handlers)
✓ RegistrationForm has controlled city input
✓ RegistrationForm has localStorage check useEffect
✓ RegistrationForm renders CardReveal on success + savedCard
✓ Hero passes cardTranslations prop
```

## Integration Points

### For Phase 05-04 (TradingCardPreview - Next Plan)
- CardReveal component ready for registration flow
- localStorage pattern established for card persistence
- Translation prop-drilling pattern consistent

### For Phase 06 (Challenge Pages)
- Challenge link format: `{origin}/c/{firstName}` (e.g., `/c/jane`)
- Link built via `buildChallengeLink(card.name, window.location.origin)`
- Challenge pages will need to accept dynamic route parameter

### Success Criteria Met

All must-have truths satisfied:
- ✓ CARD-01: User sees animated card reveal (scale + rotateY + fade, 800ms)
- ✓ CARD-02: Trading card displays via TradingCard component
- ✓ CARD-03: Deterministic gradient visible
- ✓ CARD-04: Builder class displayed (from server action)
- ✓ CARD-05: Download Card button triggers Canvas PNG export
- ✓ CARD-06: Share on X opens pre-filled tweet
- ✓ CARD-07: WhatsApp, LinkedIn, copy-to-clipboard functional
- ✓ CARD-09: Card data persisted to localStorage, returning users see card

## Technical Notes

### Component Hierarchy
```
Hero (server)
└─ getTranslations("cards") → cardTranslations
   └─ RegistrationForm (client)
      ├─ useEffect → loadCardFromStorage()
      ├─ Form submission → submitRegistration (server action)
      └─ Success/savedCard → CardReveal (client)
         ├─ TradingCard (visual component)
         ├─ downloadCard() → Canvas API
         ├─ buildTweetUrl() → Twitter intent
         └─ buildChallengeLink() → Challenge URL
```

### State Flow
1. **First visit:** Form visible, no localStorage
2. **After registration:** Server action returns CardData → construct full object → save to localStorage → render CardReveal
3. **Returning visit:** useEffect loads localStorage → render CardReveal immediately (no form)

### localStorage Schema
```json
{
  "agentNumber": "SPEC-0001",
  "name": "Jane Doe",
  "city": "Lima",
  "track": "hub",
  "builderClass": {
    "name": "The Architect",
    "desc": { "es": "...", "en": "..." }
  },
  "gradient": { "from": "hsl(...)", "to": "hsl(...)", "angle": 135 }
}
```

### Share URL Examples
- **Twitter:** `https://twitter.com/intent/tweet?text=I'm%20SPEC-0001%20...`
- **WhatsApp:** `https://wa.me/?text=Join%20me%20at%20SpecHack%202026!%20...`
- **LinkedIn:** `https://www.linkedin.com/sharing/share-offsite/?url=https://...`
- **Challenge:** `https://spechack.com/c/jane`

### Animation Timing
- Card reveal: 0ms start, 800ms duration (easeOut)
- Action buttons: 600ms delay, 500ms duration
- Share panel: 300ms height + opacity (expand/collapse)
- Copy feedback: 2000ms checkmark display

## Self-Check: PASSED

**Files created:**
```
FOUND: src/app/[locale]/_components/CardReveal.tsx
```

**Files modified:**
```
FOUND: src/app/[locale]/_components/RegistrationForm.tsx (CardReveal integration)
FOUND: src/app/[locale]/_components/Hero.tsx (cardTranslations prop)
```

**Commits:**
```
FOUND: 5a37352 (feat(05-03): create CardReveal component with animations and share actions)
FOUND: d903e24 (feat(05-03): integrate CardReveal into RegistrationForm with localStorage)
```

**Verification commands:**
```bash
✓ grep '"use client"' src/app/[locale]/_components/CardReveal.tsx
✓ grep 'export function CardReveal' src/app/[locale]/_components/CardReveal.tsx
✓ grep 'downloadCard' src/app/[locale]/_components/CardReveal.tsx
✓ grep 'buildTweetUrl' src/app/[locale]/_components/CardReveal.tsx
✓ grep 'window.location.origin' src/app/[locale]/_components/CardReveal.tsx
✓ grep 'loadCardFromStorage' src/app/[locale]/_components/RegistrationForm.tsx
✓ grep 'saveCardToStorage' src/app/[locale]/_components/RegistrationForm.tsx
✓ grep 'value={city}' src/app/[locale]/_components/RegistrationForm.tsx
✓ grep 'cardTranslations' src/app/[locale]/_components/Hero.tsx
```

All artifacts verified on disk and in git history.
