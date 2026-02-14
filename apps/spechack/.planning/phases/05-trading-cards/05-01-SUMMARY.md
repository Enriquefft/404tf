---
phase: 05-trading-cards
plan: 01
subsystem: card-utilities
tags: [canvas-api, client-utils, i18n, social-sharing]
dependency_graph:
  requires: [card-utils.ts (existing builder class functions)]
  provides: [CardData type, Canvas rendering, localStorage, share URLs, card translations]
  affects: [RegistrationForm (Phase 05-03), CardReveal (Phase 05-03), TradingCardPreview (Phase 05-04)]
tech_stack:
  added: []
  patterns:
    - Split server-safe utils from browser-only utils via separate files
    - Canvas API for PNG export with font loading guard
    - localStorage for card persistence
    - Social share URL builders (no SDK dependencies)
key_files:
  created:
    - src/lib/card-utils.client.ts
    - src/lib/share-utils.ts
  modified:
    - src/lib/card-utils.ts
    - messages/en.json
    - messages/es.json
decisions:
  - decision: Split card-utils.ts (server-safe) from card-utils.client.ts (browser APIs)
    rationale: Prevents SSR errors from Canvas/localStorage/document APIs
    alternatives: [Single file with typeof window guards]
    outcome: Cleaner separation, no runtime checks needed
  - decision: Pass locale parameter to drawCardToCanvas()
    rationale: Builder class description should match user's current language in PNG
    alternatives: [Hardcode English like blueprint]
    outcome: Localized card exports
  - decision: Add await document.fonts.ready before Canvas draw
    rationale: Prevents font fallback in downloaded PNGs (blueprint pitfall)
    alternatives: [Accept system font fallback]
    outcome: Consistent font rendering in exports
metrics:
  duration: 3.9 min
  tasks_completed: 2
  files_created: 2
  files_modified: 3
  commits: 1
  completed_date: 2026-02-14
---

# Phase 5 Plan 1: Card Utilities and Types Summary

**One-liner:** Server-safe CardData type, city flags, client-side Canvas rendering, localStorage, and social share URL builders with bilingual card translations.

## What Was Built

### 1. Extended card-utils.ts (Server-Safe)
Added to existing file (keeps all builder class functions):
- **CardData type** — Defines structure: agentNumber, name, city, track, builderClass, gradient
- **CITY_FLAGS map** — 25 Latin American cities + "virtual" mapped to country flag emoji with globe fallback
- **getCountryFlag()** — Resolves city string to flag emoji with fallback to 🌍

**NO browser APIs** — File remains server-safe for use in server actions and components.

### 2. New card-utils.client.ts (Browser-Only)
Created with `"use client"` directive:
- **drawCardToCanvas(card, locale)** — Renders 600x800px card with gradient, agent number, name, city flag, track badge, builder class
  - Uses locale parameter for builder class description (fixes blueprint hardcoded English)
  - Canvas API with 2D context: fillText, fillRect, linearGradient
  - Fonts: Orbitron (headings), JetBrains Mono (body)
- **downloadCard(card, locale)** — Triggers PNG download
  - `await document.fonts.ready` before rendering (prevents font fallback)
  - Blob creation → object URL → download link → cleanup
- **saveCardToStorage(data)** — Persists CardData to localStorage (`spechack_card`)
- **loadCardFromStorage()** — Retrieves CardData with try/catch (returns null on failure)

### 3. New share-utils.ts (Pure URL Builders)
NO "use client" needed — pure string functions:
- **buildTweetUrl(text)** — Twitter/X intent URL with encoded text
- **buildWhatsAppUrl(text)** — WhatsApp share URL with encoded text
- **buildLinkedInUrl(url)** — LinkedIn share-offsite URL
- **buildChallengeLink(name, origin)** — Challenge page URL (`/c/{firstName}`)

### 4. Translation Files
Added "cards" namespace to both en.json and es.json:
- `previewTagline`, `download`, `shareX`, `challenge`, `challengeCopy`, `challengeWhatsApp`, `challengeLinkedIn`, `recruitMore`, `tweetTemplate`
- Spanish translations from blueprint i18n.ts verified for accuracy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical Feature] Added font loading guard before Canvas rendering**
- **Found during:** Task 1 implementation
- **Issue:** Blueprint's drawCardToCanvas doesn't wait for fonts, causing Canvas to render with system fonts if Google Fonts aren't loaded yet
- **Fix:** Added `await document.fonts.ready` in downloadCard() before calling drawCardToCanvas()
- **Files modified:** src/lib/card-utils.client.ts
- **Commit:** 68e85bb (bundled with main implementation)
- **Rationale:** Critical for correct PNG exports — missing fonts would show as monospace fallback

## Verification Results

**Build check:**
```
✓ bun run build — No SSR errors, no type errors
✓ TypeScript compilation passed
✓ Static page generation successful (4/4 routes)
```

**Lint check:**
```
✓ bun run lint — Biome formatting/linting passed
```

**File verification:**
```
✓ CardData type exported from card-utils.ts
✓ CITY_FLAGS map and getCountryFlag() exist
✓ card-utils.client.ts has "use client" directive
✓ drawCardToCanvas, downloadCard, saveCardToStorage, loadCardFromStorage exported
✓ share-utils.ts exports all 4 URL builders
✓ cards namespace exists in both en.json and es.json
```

## Integration Points

### For Phase 05-02 (TradingCard Component)
- Import `CardData` type from `@/lib/card-utils`
- Import `getCountryFlag()` for city display
- Use CardData props for visual rendering

### For Phase 05-03 (CardReveal)
- Import `downloadCard()`, `saveCardToStorage()` from `@/lib/card-utils.client`
- Import all share URL builders from `@/lib/share-utils`
- Use card translations passed as props from server component

### For Phase 05-04 (TradingCardPreview)
- Import `CardData` type for static preview data
- Use card.previewTagline translation

## Technical Notes

### Canvas Rendering Details
- **Dimensions:** 600x800px (3:4 aspect ratio, card-shaped)
- **Background:** Dark (`hsl(240,10%,7%)`) with 15% opacity gradient overlay
- **Layout:** Logo + agent # at top, name at y=180, city at y=220, track badge at y=260, builder class section at y=340-430, footer at bottom
- **Gradient:** Uses card.gradient data (angle converted to radians for linearGradient)

### Font Loading Strategy
- Fonts loaded via CSS (assumed from layout.tsx or globals.css)
- `document.fonts.ready` promise ensures fonts are available before Canvas draw
- Fallback: If fonts unavailable, Canvas uses system monospace (acceptable degradation)

### localStorage Schema
```json
{
  "agentNumber": "0001",
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

### Share URL Patterns
- **X/Twitter:** `https://twitter.com/intent/tweet?text={encoded}`
- **WhatsApp:** `https://wa.me/?text={encoded}`
- **LinkedIn:** `https://www.linkedin.com/sharing/share-offsite/?url={encoded}`
- **Challenge link:** `{origin}/c/{firstName}` (e.g., `/c/jane`)

## Self-Check: PASSED

**Files created:**
```
FOUND: src/lib/card-utils.client.ts
FOUND: src/lib/share-utils.ts
```

**Files modified:**
```
FOUND: src/lib/card-utils.ts (CardData, CITY_FLAGS, getCountryFlag added)
FOUND: messages/en.json (cards namespace added)
FOUND: messages/es.json (cards namespace added)
```

**Commits:**
```
FOUND: 68e85bb (feat(05-01): add CardData type, Canvas utilities, and share functions)
```

**Verification commands:**
```bash
✓ grep "export type CardData" src/lib/card-utils.ts
✓ grep "CITY_FLAGS" src/lib/card-utils.ts
✓ grep '"use client"' src/lib/card-utils.client.ts
✓ grep "export function drawCardToCanvas" src/lib/card-utils.client.ts
✓ grep "export function buildTweetUrl" src/lib/share-utils.ts
✓ grep '"cards"' messages/en.json
✓ grep '"cards"' messages/es.json
```

All artifacts verified on disk and in git history.
