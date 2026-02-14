# Phase 7 Context: Polish & Edge Cases

## Phase Goal

Add UX refinements, loading states, error boundaries, and edge case handling for production readiness.

## Decisions

### 1. Loading State Visuals

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Landing page skeleton | No page skeleton | Server components render HTML directly — no blank screen. Only dynamic parts need loading states |
| Challenge page loading | Pulsing shimmer skeleton | Show card-shaped placeholder + text shimmer during navigation to /c/[name] |
| Card reveal loading | Spinner in submit button only | Button shows spinner while submitting, then card reveal animation plays immediately — no interim card placeholder |
| Loading indicator style | Pulsing shimmer | Subtle dark-to-lighter pulse matching the blueprint dark theme |

**Implementation notes:**
- Create `loading.tsx` for the challenge page route only (`/[locale]/c/[name]/loading.tsx`)
- No `loading.tsx` needed for the main landing page
- Shimmer should use the existing dark theme colors (darker to slightly lighter pulse)

### 2. Error Recovery UX

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Field validation errors | Inline on input | Show error message directly below the field that failed validation |
| Whole form errors (server/network) | Toast notification | Floating toast for database/network errors — keeps form visible and intact |
| Input preservation | Preserve all inputs | All fields keep their values after error — user just retries |
| Challenge page errors | Error boundary with retry | "Something went wrong" message with retry button that reloads the page |
| Error boundary scope | Targeted only | Error boundaries around forms and challenge page only — static content can't fail |

**Implementation notes:**
- Need a toast component (lightweight, no external lib — or use a minimal one)
- Error boundary around the challenge page route (`error.tsx`)
- Registration and ambassador forms should catch server action errors and show toast
- Field-level errors from Zod validation displayed inline below each input

### 3. Form Submission Feedback

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Submit button loading | Spinner replacing text | Button text changes to spinning icon, button stays same size, disabled |
| Registration success | Card reveal animation only | The animated card reveal IS the success state — no extra toast |
| Ambassador success | Animated form collapse | Form collapses with animation, replaced by "Application submitted!" message |
| Validation timing | On blur + on submit | Validate when user leaves a field and on form submission |

**Implementation notes:**
- `useActionState` already provides pending state — use it for button spinner
- Ambassador form needs collapse animation (Framer Motion AnimatePresence)
- On-blur validation means adding `onBlur` handlers to form fields with Zod partial validation
- Registration form currently uses `useActionState` — extend for blur validation

### 4. Production Edge Cases

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Long names on cards | Truncate at ~20 chars with ellipsis | Cards have limited space; full name preserved in metadata |
| Special characters in URLs | URL-encode, display real name | /c/Mar%C3%ADa in URL but "María" displayed on page |
| Invalid challenge URLs | Toast + redirect to home | Empty or invalid names show toast then redirect to landing page |

**Implementation notes:**
- Name truncation applies to TradingCard component, Canvas PNG export, and OG image
- Challenge page `generateMetadata` should handle edge cases (empty name, special chars)
- Add validation in challenge page: if name is empty or only special chars, redirect
- encodeURIComponent already used in buildChallengeLink (from Phase 6)

## Deferred Ideas

None captured during discussion.

## Scope Boundary

This phase covers:
- Loading states for dynamic content (challenge page skeleton)
- Error boundaries and error display (inline field errors, toast for server errors)
- Form UX improvements (button states, blur validation, ambassador collapse animation)
- Edge case handling (long names, special chars, invalid URLs)
- Hydration warning fixes (if any exist)
- Animation performance audit

This phase does NOT cover:
- New features or capabilities
- Analytics/tracking (would be its own phase)
- Accessibility audit (would be its own phase)
- Performance optimization beyond animation jank
