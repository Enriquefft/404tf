# Phase 3 Plan 1: Interactive Navbar and Banner Summary

**One-liner:** Client Component conversion with scroll-based navbar hide/show, animated hamburger menu, locale-aware language switcher, and localStorage-persisted banner dismissal

---

## Performance

**Duration:** 4.0 minutes
**Tasks completed:** 2/2
**Commits:** 2 atomic commits
**Lines of code:** ~300 LOC added (hooks + interactive components)

## Accomplishments

### Task 1: Dependencies and Custom Hooks ✓
- Installed 4 Phase 3 dependencies: framer-motion (12.34.0), react-countup (6.5.3), react-intersection-observer (10.0.2), hamburger-react (2.5.2)
- Created `useScrollDirection` hook with passive scroll event listener, 10px threshold to avoid jitter, proper cleanup
- Created `useLocalStorage` hook with SSR-safe initialization, useEffect-based client-side reading, 404tf: namespace convention
- Both hooks include "use client" directive and comprehensive JSDoc

### Task 2: Client Component Conversion ✓
- Converted Navbar from async Server Component to interactive Client Component
  - Scroll-based show/hide using useScrollDirection hook with 300ms transition
  - Animated hamburger mobile menu with hamburger-react Squash component
  - Working language switcher using next-intl's useRouter/usePathname with scroll preservation
  - Mobile menu panel with all nav links, SpecHack badge, language switcher, and CTA
  - Mobile menu closes on nav link click
- Converted AnnouncementBanner from async Server Component to interactive Client Component
  - Dismissible via X button (lucide-react)
  - localStorage persistence with key "404tf:announcement-spechack:dismissed"
  - Returns null when dismissed (SSR-safe)
- Updated page.tsx to fetch translations and pass as props to Client Components
  - Added getTranslations calls for nav and banner
  - Cast locale to "es" | "en" type for type safety

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install dependencies and create custom hooks | 30d5239 | package.json, bun.lock, src/hooks/useScrollDirection.ts, src/hooks/useLocalStorage.ts |
| 2 | Convert Navbar and AnnouncementBanner to Client Components | 3984d2f | src/app/[locale]/_components/Navbar.tsx, src/app/[locale]/_components/AnnouncementBanner.tsx, src/app/[locale]/page.tsx |

## Files Created

- `src/hooks/useScrollDirection.ts` - Custom hook for scroll direction detection
- `src/hooks/useLocalStorage.ts` - SSR-safe localStorage persistence hook

## Files Modified

- `package.json` - Added framer-motion, react-countup, react-intersection-observer, hamburger-react
- `bun.lock` - Locked new dependencies
- `src/app/[locale]/_components/Navbar.tsx` - Converted to Client Component with scroll/menu/language features
- `src/app/[locale]/_components/AnnouncementBanner.tsx` - Converted to Client Component with dismiss persistence
- `src/app/[locale]/page.tsx` - Fetch and pass translations to Client Components

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Use hamburger-react Squash component | Lightweight (1.5KB), pre-built animations, accessibility built-in | Cleaner code than custom SVG transforms |
| Use next-intl's createNavigation for routing | Already configured in src/i18n/navigation.ts, provides useRouter/usePathname | Proper locale-aware navigation with scroll preservation |
| localStorage key namespace: 404tf: | Avoid key collisions, documented in useLocalStorage JSDoc | Consistent localStorage convention across app |
| Biome suppression for useValidAnchor | Mobile CTA anchor is valid navigation to #intent-cta section | Avoids false positive linting error |
| SSR-safe localStorage pattern | Initialize with default value, read in useEffect after hydration | Prevents hydration mismatches |
| 10px scroll threshold in useScrollDirection | Prevents jitter from small scroll movements | Smoother UX, fewer re-renders |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

### Issue 1: Biome useValidAnchor false positive
**Description:** Biome flagged mobile menu CTA anchor with onClick handler as invalid
**Resolution:** Added biome-ignore comment - anchor is valid for navigation to #intent-cta
**Category:** Linting configuration
**Time impact:** Minimal (~1 minute)

## Next Phase Readiness

### Blockers
None

### Prerequisites for 03-02 (TractionBar + Scroll Animations)
- ✓ framer-motion installed
- ✓ react-countup installed
- ✓ react-intersection-observer installed
- ✓ Custom hooks pattern established

### Concerns
None - all Phase 3 dependencies installed, patterns working as expected

### Recommendations
- TractionBar can proceed immediately with react-countup's enableScrollSpy
- FadeInSection wrapper can use Framer Motion's whileInView for scroll animations
- Consider LazyMotion if bundle size becomes concern (optional optimization)

---

**Verified:** All success criteria met
- ✓ Navbar hides on scroll down, reappears on scroll up
- ✓ Hamburger menu opens/closes on mobile (md: breakpoint)
- ✓ Language switcher navigates between /es and /en preserving scroll position
- ✓ AnnouncementBanner dismisses and persists via localStorage
- ✓ No hydration errors (verified with production build)
- ✓ Zero Biome errors, zero TypeScript errors

**Build status:** ✓ Production build successful (Next.js 16.1.6 Turbopack)

## Self-Check: PASSED

All created files verified:
- ✓ src/hooks/useScrollDirection.ts
- ✓ src/hooks/useLocalStorage.ts

All task commits verified:
- ✓ 30d5239 (Task 1)
- ✓ 3984d2f (Task 2)
