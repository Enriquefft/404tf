---
phase: 02-static-content-migration
plan: 01
subsystem: content-infrastructure
completed: 2026-02-13
duration: 3.4m

requires:
  - 01-01 # Next.js app structure
  - 01-02 # i18n routing configuration

provides:
  - Complete bilingual translation content for all 7 sections
  - i18n navigation utilities for client-side locale switching
  - useScrollDirection hook for navbar
  - hamburger-react dependency for mobile menu
  - Scroll behavior CSS for anchor navigation

affects:
  - 02-02 # Navbar will consume translations, navigation, useScrollDirection, hamburger-react
  - 02-03 # Hero will consume hero translations
  - 02-04 # All sections will consume their respective translations

tech-stack:
  added:
    - hamburger-react # Mobile menu component
  patterns:
    - Translation prop-drilling pattern (server components pass translated strings to client components)
    - Flat key patterns for array-like content in next-intl

key-files:
  created:
    - src/i18n/navigation.ts # Client-side navigation utilities
    - src/hooks/useScrollDirection.ts # Scroll direction detection hook
  modified:
    - package.json # Added hamburger-react dependency
    - messages/es.json # Complete Spanish translations for all sections
    - messages/en.json # Complete English translations for all sections
    - src/styles/globals.css # Added scroll-padding-top and scroll-behavior

decisions:
  - decision: Use flat key patterns (criteria0Label, prize0Emoji) instead of nested arrays
    rationale: Avoids complexity with array indexing in next-intl translation lookups
    phase-plan: 02-01
  - decision: Keep {bold}{/bold} markers in manifesto translation strings
    rationale: Enables runtime parsing for styled text spans without HTML in translations
    phase-plan: 02-01
  - decision: Set scroll-padding-top to 5rem (navbar 4rem + 1rem breathing room)
    rationale: Prevents fixed navbar from covering anchor link targets
    phase-plan: 02-01

tags: [i18n, translations, next-intl, hooks, dependencies, bilingual, spanish, english, navigation]
---

# Phase 02 Plan 01: Translation Infrastructure Summary

JWT auth with refresh rotation using jose library

## One-liner

Complete bilingual translation content (es/en) for all 7 sections, i18n navigation utilities, scroll detection hook, and hamburger-react dependency installed.

## What Was Built

Created the single source of truth for all bilingual content by porting the Vite blueprint's i18n.ts file to next-intl's JSON format. Added shared utilities needed by every section component: i18n navigation for locale switching, useScrollDirection hook for the navbar, and CSS configuration for smooth anchor navigation.

**Translation Namespaces Created (9 total):**
- navbar — Navigation link labels (7 links)
- hero — Hero section with registration form (19 keys)
- manifesto — Challenge pitch with {bold} markers (3 keys)
- phases — How it works timeline (11 keys)
- judging — Criteria and prizes with flat keys (17 keys)
- hubs — Hub and ambassador content (12 keys)
- sponsors — Partnership pitch (11 keys)
- faq — 4 Q&A pairs (9 keys)
- footer — Footer links (5 keys)

**Shared Utilities:**
- `src/i18n/navigation.ts` — Exports Link, redirect, usePathname, useRouter from next-intl createNavigation
- `src/hooks/useScrollDirection.ts` — Returns "up", "down", or null based on scroll position with 10px jitter threshold
- `src/styles/globals.css` — Added scroll-behavior: smooth and scroll-padding-top: 5rem for fixed navbar

**Dependencies:**
- Installed `hamburger-react` package for Navbar mobile menu (Plan 02-02)

**Content Porting Notes:**
- Preserved all accent characters and special characters (UTF-8)
- Kept {bold}{/bold} markers in manifesto strings for runtime parsing
- Used flat key patterns (criteria0Label, prize1Emoji) to avoid array complexity
- Both es.json and en.json have identical key structure (110+ keys each)

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 8f99286 | Install dependencies and create shared utilities |
| 2 | e4cc781 | Populate complete bilingual translation files |

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

**Build Verification:**
- `bun run build` succeeds with no TypeScript errors
- Both JSON files parse correctly
- next-intl loads all namespaces without errors
- Key parity verified between es.json and en.json (identical structure)

**File Verification:**
- hamburger-react appears in package.json dependencies
- i18n/navigation.ts exports Link, redirect, usePathname, useRouter
- useScrollDirection hook has "use client" directive
- globals.css includes scroll-padding-top and scroll-behavior

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Dependencies satisfied for next plans:**
- Plan 02-02 (Navbar): Has translations (navbar namespace), navigation utilities, useScrollDirection hook, hamburger-react package
- Plan 02-03 (Hero): Has translations (hero namespace)
- Plan 02-04 (All Sections): Has translations (manifesto, phases, judging, hubs, sponsors, faq, footer namespaces)

All section components in Plans 02-02 through 02-04 can now consume their respective translations and shared utilities.

## Decisions Made

**1. Flat key patterns instead of nested arrays**
- Chose: `criteria0Label`, `prize1Emoji`, etc.
- Over: Nested array structures in JSON
- Why: Avoids complexity with array indexing in next-intl translation lookups
- Impact: Simpler component code, easier to maintain

**2. Runtime {bold} marker parsing**
- Chose: Keep `{bold}` and `{/bold}` markers in translation strings
- Over: Storing HTML in translations or splitting strings
- Why: Keeps translations clean, enables styled spans without HTML injection
- Impact: Components need to parse markers and render styled spans

**3. Scroll padding for fixed navbar**
- Chose: 5rem scroll-padding-top (4rem navbar + 1rem breathing room)
- Over: JavaScript scroll offset calculation
- Why: CSS-native solution, no JavaScript needed, consistent behavior
- Impact: Anchor links scroll to correct position automatically

## Self-Check: PASSED
