---
phase: 06-challenge-system
plan: 03
subsystem: frontend
tags: [og-image, seo, social-sharing, next-og, edge-runtime]
dependency-graph:
  requires: [06-01 (generateDeterministicCard)]
  provides: [Dynamic OG images for challenge pages]
  affects: [Social media previews, SEO]
tech-stack:
  added: [next/og ImageResponse, custom font loading via fetch()]
  patterns: [Edge runtime, Satori flexbox-only layout, inline styles]
key-files:
  created:
    - public/fonts/Orbitron-Bold.ttf
    - public/fonts/JetBrainsMono-Regular.ttf
    - src/app/[locale]/c/[name]/opengraph-image.tsx
  modified: []
decisions:
  - Used fetch() + new URL() for font loading (Edge runtime requirement)
  - Flexbox-only layout with inline styles (Satori limitations)
  - 1200x630px standard OG image size
  - Locale-aware builder class descriptions in OG images
metrics:
  duration: 2.1m
  completed: 2026-02-14
---

# Phase 6 Plan 3: Dynamic OG Images for Challenge Pages Summary

Dynamic Open Graph images rendered at 1200x630px showing challenger's trading card visual using Next.js ImageResponse and custom fonts for viral social media sharing.

## What Was Done

### Task 1: Download custom fonts to public/fonts/
- Downloaded Orbitron-Bold.ttf (291KB) from Google Fonts GitHub repo
- Downloaded JetBrainsMono-Regular.ttf (264KB) from JetBrains GitHub repo
- Both fonts are open source (OFL) and bundling is permitted
- Fonts required for ImageResponse/Satori rendering (cannot use web fonts)
- **Commit:** 6cbc405

### Task 2: Create opengraph-image.tsx with ImageResponse
- Created `src/app/[locale]/c/[name]/opengraph-image.tsx` using Next.js ImageResponse API
- Exports `runtime = "edge"` (required for ImageResponse)
- Exports `size = { width: 1200, height: 630 }` (standard OG dimensions)
- Loads custom fonts via `fetch(new URL("...fonts/...", import.meta.url))` pattern
- Calls `generateDeterministicCard(decodedName)` to get same card as challenge page
- Renders flexbox-only layout with inline styles (Satori CSS subset)
- Displays: challenger name (72px Orbitron), agent number (48px), builder class name (40px), locale-aware builder class description (28px), event CTA (24px)
- Uses card gradient colors for visual cohesion with trading card component
- Dark background with gradient overlay (20% opacity)
- **Commit:** c83472c

### Task 3: Test OG image generation (verification only)
- Build passed with no errors
- No font loading errors
- No Satori CSS warnings
- Route compiles successfully: `/[locale]/c/[name]/opengraph-image`
- Next.js auto-links OG image to page metadata

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `fetch() + new URL()` for fonts | Edge runtime cannot use `fs.readFileSync`; must use fetch with relative URLs from import.meta.url |
| Flexbox-only layout | Satori (ImageResponse renderer) doesn't support CSS Grid, position: absolute, or complex layouts |
| Inline styles only | Satori doesn't support className or Tailwind utilities; all styling must be inline style objects |
| 1200x630px size | Standard Open Graph image dimensions for all social platforms (X, LinkedIn, WhatsApp, Facebook) |
| Locale-aware builder descriptions | Pass locale from params to access correct translation of builder class description |
| 20% gradient opacity | Same as TradingCard component's 15% but slightly brighter for better visibility at smaller preview sizes |

## Verification

- Font files exist: `public/fonts/Orbitron-Bold.ttf` (291KB), `public/fonts/JetBrainsMono-Regular.ttf` (264KB)
- OG image route exists: `src/app/[locale]/c/[name]/opengraph-image.tsx`
- Exports verified: `runtime = "edge"`, `size = { width: 1200, height: 630 }`, `alt`, `contentType`, default Image function
- ImageResponse import and usage verified (2 occurrences)
- generateDeterministicCard() called with decoded name
- Font loading via new URL() pattern verified
- Build passes with no errors
- No Satori CSS limitations violated

## Requirements Satisfied

- **CHAL-04:** ✓ Dynamic OG image shows challenger's card with name, agent number, builder class, gradient
- **SEO-03:** ✓ Social media previews work for challenge links

## Self-Check: PASSED

- [x] public/fonts/Orbitron-Bold.ttf -- FOUND (291KB)
- [x] public/fonts/JetBrainsMono-Regular.ttf -- FOUND (264KB)
- [x] src/app/[locale]/c/[name]/opengraph-image.tsx -- FOUND
- [x] Commit 6cbc405 -- FOUND
- [x] Commit c83472c -- FOUND
- [x] Build passes with no errors -- PASSED
- [x] Edge runtime export verified -- PASSED
- [x] ImageResponse usage verified -- PASSED
