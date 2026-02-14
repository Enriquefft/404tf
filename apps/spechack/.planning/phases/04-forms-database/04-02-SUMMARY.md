---
phase: 04-forms-database
plan: 02
subsystem: frontend
tags: [forms, useActionState, client-components, registration, ambassador]
dependency-graph:
  requires: [04-01 (server actions + schema)]
  provides: [RegistrationForm, AmbassadorForm]
  affects: [04-03 (form polish), 05-xx (card reveal animation)]
tech-stack:
  added: []
  patterns: [useActionState + hidden fields, translation prop-drilling, expand/collapse form]
key-files:
  created:
    - apps/spechack/src/app/[locale]/_components/RegistrationForm.tsx
    - apps/spechack/src/app/[locale]/_components/AmbassadorForm.tsx
  modified:
    - apps/spechack/src/app/[locale]/_components/Hero.tsx
    - apps/spechack/src/app/[locale]/_components/Hubs.tsx
decisions:
  - Hidden locale and track fields sent via form (no client-side imports of server modules)
  - Track toggle uses useState for local state, hidden input for form submission
  - AmbassadorForm starts collapsed as CTA button, expands on click
  - Success state for registration shows agent number in mono font (Phase 5 adds card reveal)
metrics:
  duration: 2.4m
  completed: 2026-02-14
---

# Phase 4 Plan 2: Client Form Components Summary

Two client form components (RegistrationForm, AmbassadorForm) wired to Server Actions via useActionState, with track toggle, per-field validation errors, success states, and translation prop-drilling from server parents.

## What Was Done

### Task 1: RegistrationForm + Hero update
- Created `RegistrationForm.tsx` client component with `useActionState(submitRegistration, null)`
- Track toggle (virtual/hub) using `useState` with visual segmented control feedback
- Hidden `locale` and `track` fields for server action consumption
- Per-field validation error display below each input (name, email, city)
- Success state renders agent number (e.g., `SPEC-0001`) in large mono primary-colored text
- Updated `Hero.tsx` to import `getLocale`, pass 12 translated strings + locale to RegistrationForm
- Hero remains a server component (no "use client" cascade)

### Task 2: AmbassadorForm + Hubs update
- Created `AmbassadorForm.tsx` client component with three states: collapsed, expanded form, success
- Collapsed state shows CTA button matching original Hubs styling
- Expanded form has name/email/city/community(textarea) fields with `useActionState(submitAmbassador, null)`
- Hidden `locale` field for server action
- Success state shows green checkmark SVG with `aria-label` for accessibility
- Updated `Hubs.tsx` to import `getLocale`, pass 7 translated strings + locale to AmbassadorForm
- Hubs remains a server component (no "use client" cascade)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SVG accessibility violation**
- **Found during:** Task 2 (Biome check)
- **Issue:** Biome `noSvgWithoutTitle` rule flagged the checkmark SVG in AmbassadorForm success state
- **Fix:** Added `role="img"` and `aria-label="checkmark"` to the SVG element
- **Files modified:** AmbassadorForm.tsx
- **Commit:** fc720cb

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Hidden fields for locale/track | Avoids importing server modules in client components; clean form data flow |
| useState for track toggle | Local UI state only; value sent to server via hidden input |
| Collapsed CTA button default for ambassador | Preserves original Hubs visual; form appears on demand |
| Mono font agent number in success | Matches SpecHack blueprint aesthetic; Phase 5 replaces with full card reveal |

## Verification

- `bunx @biomejs/biome check` passes with no errors on all 4 files
- `bun run build` compiles successfully (TypeScript + Next.js)
- Hero.tsx renders `<RegistrationForm />` (no inline form markup)
- Hubs.tsx renders `<AmbassadorForm />` (no inline CTA button)
- Both parent components remain server components (no "use client")
- Both forms have hidden locale fields
- RegistrationForm has hidden track field + track toggle with visual feedback
- AmbassadorForm has collapse/expand/success states

## Self-Check: PASSED

- [x] apps/spechack/src/app/[locale]/_components/RegistrationForm.tsx -- FOUND
- [x] apps/spechack/src/app/[locale]/_components/AmbassadorForm.tsx -- FOUND
- [x] apps/spechack/src/app/[locale]/_components/Hero.tsx -- FOUND
- [x] apps/spechack/src/app/[locale]/_components/Hubs.tsx -- FOUND
- [x] Commit 287d5b9 -- FOUND
- [x] Commit fc720cb -- FOUND
