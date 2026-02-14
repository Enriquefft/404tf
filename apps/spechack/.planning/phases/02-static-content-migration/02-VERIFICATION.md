---
phase: 02-static-content-migration
verified: 2026-02-14T03:35:19Z
status: gaps_found
score: 4/5 truths verified
gaps:
  - truth: "User scrolling on desktop sees Navbar background become opaque, and can click all navigation links to jump to sections"
    status: partial
    reason: "Missing anchor IDs - #hubs link in Navbar has no corresponding section ID, Footer links to #hero but section uses #register"
    artifacts:
      - path: "src/app/[locale]/_components/Hubs.tsx"
        issue: "Missing id='hubs' attribute on root div wrapper"
      - path: "src/app/[locale]/_components/Footer.tsx"
        issue: "Links to #hero but Hero section uses id='register'"
    missing:
      - "Add id='hubs' to Hubs.tsx root div wrapper"
      - "Change Footer link from #hero to #register OR add id='hero' to Hero section"
---

# Phase 2: Static Content Migration Verification Report

**Phase Goal:** Port all static landing sections from Vite SPA to Next.js Server Components with bilingual content  
**Verified:** 2026-02-14T03:35:19Z  
**Status:** gaps_found  
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can toggle between ES/EN languages via Navbar and see URL change to `/es/` or `/en/` with all content updating correctly | ✓ VERIFIED | Navbar.tsx implements language switcher using useRouter/usePathname from @/i18n/navigation (lines 48-50). Both messages/es.json and messages/en.json have identical key structure (10 namespaces). All server components use getTranslations("namespace"). Build succeeds. |
| 2 | User scrolling on desktop sees Navbar background become opaque, and can click all navigation links to jump to sections | ⚠️ PARTIAL | Navbar scroll behavior verified: useScrollDirection hook (line 24), scroll opacity logic (lines 29-33), backdrop-blur CSS (line 56). **However, anchor navigation has broken links:** Navbar links to `#hubs` (line 39) but no section has id="hubs". Footer links to `#hero` (line 21) but Hero section has id="register", not id="hero". |
| 3 | User on mobile can tap hamburger menu icon, see drawer open with navigation links, and close it | ✓ VERIFIED | Navbar.tsx uses hamburger-react package (line 4, installed in package.json line 17). Mobile menu state (line 22), toggle handler (line 110), conditional render (lines 116-165), handleLinkClick closes menu (lines 44-46, called on line 123). |
| 4 | User sees all 7 landing sections (Hero, Manifesto, Judging, Hubs, Sponsors, FAQ, Footer) with correct bilingual content matching the locale in the URL | ✓ VERIFIED | page.tsx imports all 8 components (lines 2-9), renders in order (lines 23-49). All components exist, are substantive (Hero: 111 lines, Manifesto: 107 lines, Judging: 81 lines, Hubs: 62 lines, Sponsors: 72 lines, FAQ: 56 lines, Footer: 117 lines, Navbar: 168 lines), use getTranslations for bilingual content. Build succeeds with no TypeScript errors. |
| 5 | User can click FAQ accordion items and see them expand/collapse with smooth transitions without requiring JavaScript reload | ✓ VERIFIED | FAQ.tsx uses native `<details>` elements (lines 13, 23, 33, 43) with `<summary>` (lines 14, 24, 34, 44). Chevron rotation via `group-open:rotate-180` (lines 16, 26, 36, 46). globals.css hides default disclosure markers (lines 62-67). No JavaScript required - native HTML behavior. |

**Score:** 4/5 truths verified (1 partial due to broken anchor links)

### Required Artifacts

All artifacts from all 4 plans exist and are substantive:

**Plan 02-01 artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/i18n/navigation.ts` | Client-side navigation utilities | ✓ VERIFIED | Exports Link, redirect, usePathname, useRouter (line 4). Imports createNavigation from next-intl/navigation (line 1), imports routing (line 2). 5 lines. |
| `src/hooks/useScrollDirection.ts` | Scroll direction hook | ✓ VERIFIED | "use client" directive (line 1), returns "up" \| "down" \| null (line 10), 10px threshold (line 20), passive scroll listener (line 27), cleanup (line 28). 32 lines. |
| `messages/es.json` | Spanish translations | ✓ VERIFIED | 10 namespaces: navbar, hero, manifesto, phases, judging, hubs, sponsors, faq, footer, NotFound. 125 lines. |
| `messages/en.json` | English translations | ✓ VERIFIED | Identical key structure to es.json (verified via node comparison). 125 lines. |

**Plan 02-02 artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/[locale]/_components/Navbar.tsx` | Scroll-aware navbar with language switcher and mobile menu | ✓ VERIFIED | 168 lines (exceeds min_lines: 80). "use client" directive, imports useScrollDirection (line 6), hamburger-react (line 4), useRouter/usePathname (line 5). Scroll hide/show (lines 54-56), language switcher (lines 82-96), mobile menu (lines 116-165). |
| `src/app/[locale]/_components/Hero.tsx` | Hero section with headline, form placeholder, anchor link | ✓ VERIFIED | 111 lines. Async server component, getTranslations("hero") (line 4), exports Hero (line 3), id="register" (line 8), presentational form with type="button" (line 99), anchor link to #manifesto (line 28). |
| `src/app/[locale]/_components/Manifesto.tsx` | Manifesto with bold text parsing and phase cards | ✓ VERIFIED | 107 lines. Async server component, getTranslations("manifesto") and getTranslations("phases") (lines 36-37), renderBold function (lines 8-33), 3 phase cards (lines 39-58), lucide-react icons (line 3). |

**Plan 02-03 artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/[locale]/_components/Judging.tsx` | Judging criteria bars and prize categories | ✓ VERIFIED | 81 lines. Async server component, getTranslations("judging") (line 4), exports Judging (line 3), root wrapper is `<div>` (line 23, not section), 5 criteria bars with static widths (lines 29-46), 5 prizes (lines 49-65). |
| `src/app/[locale]/_components/Hubs.tsx` | City map, ambassador pitch, application form | ⚠️ ORPHANED | 62 lines. Async server component, getTranslations("hubs") (line 5), root wrapper is `<div>` (line 17), city map with 6 cities (lines 7-14, 25-45), ambassador pitch (line 48), CTA button (lines 53-59). **Missing id="hubs" for anchor navigation.** |
| `src/app/[locale]/_components/Sponsors.tsx` | Sponsor metrics, value props, CTAs | ✓ VERIFIED | 72 lines. Async server component, getTranslations("sponsors") (line 5), id="sponsors" (line 15), 3 metrics (lines 7-11, 26-37), 3 value props (lines 40-44), 2 CTA buttons (lines 47-62), ExternalLink icon (line 2). |

**Plan 02-04 artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/[locale]/_components/FAQ.tsx` | FAQ accordion with native details/summary | ✓ VERIFIED | 56 lines. Async server component, getTranslations("faq") (line 4), id="faq" (line 7), 4 `<details>` elements (lines 13, 23, 33, 43), chevron rotation (group-open:rotate-180). |
| `src/app/[locale]/_components/Footer.tsx` | Footer with logos, links, contact | ⚠️ PARTIAL | 117 lines. Async server component, getTranslations("footer") (line 4), brand text (lines 12-14), nav links (lines 19-44), social links (lines 47-96), contact email (lines 104-108). **Links to #hero (line 21) but Hero section has id="register".** |
| `src/app/[locale]/page.tsx` | Page composition root | ✓ VERIFIED | 52 lines (exceeds min_lines: 30). Imports all 8 components (lines 2-9), fetches navbar translations (line 19), passes to Navbar as props (lines 23-34), renders all sections in order (lines 35-49), Judging+Hubs in shared section with id="prizes" (lines 38-45). |

### Key Link Verification

**Plan 02-01 key links:**

| From | To | Via | Status | Detail |
|------|----|----|--------|--------|
| `src/i18n/navigation.ts` | `src/i18n/routing.ts` | createNavigation import | ✓ WIRED | Line 2 imports routing, line 4 calls createNavigation(routing) |

**Plan 02-02 key links:**

| From | To | Via | Status | Detail |
|------|----|----|--------|--------|
| `Navbar.tsx` | `useScrollDirection` | hook import | ✓ WIRED | Line 6 imports, line 24 calls useScrollDirection() |
| `Navbar.tsx` | `@/i18n/navigation` | useRouter/usePathname | ✓ WIRED | Line 5 imports, lines 25-26 call both hooks |
| `Hero.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 1 imports, line 4 calls getTranslations("hero") |
| `Manifesto.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 2 imports, lines 36-37 call getTranslations twice |

**Plan 02-03 key links:**

| From | To | Via | Status | Detail |
|------|----|----|--------|--------|
| `Judging.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 1 imports, line 4 calls getTranslations("judging") |
| `Hubs.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 1 imports, line 5 calls getTranslations("hubs") |
| `Sponsors.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 1 imports, line 5 calls getTranslations("sponsors") |

**Plan 02-04 key links:**

| From | To | Via | Status | Detail |
|------|----|----|--------|--------|
| `page.tsx` | `Navbar.tsx` | import and render with props | ✓ WIRED | Line 2 imports, lines 23-34 render with translation props |
| `page.tsx` | `Hero.tsx` | import and render | ✓ WIRED | Line 3 imports, line 36 renders <Hero /> |
| `page.tsx` | `next-intl/server` | getTranslations | ✓ WIRED | Line 1 imports, line 19 calls getTranslations("navbar") |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| LAND-01 (Navbar: bilingual toggle, scroll, mobile menu) | ✓ SATISFIED | All truths verified |
| LAND-02 (Hero: headline, date, anchor link) | ✓ SATISFIED | All truths verified |
| LAND-03 (Hero: registration form placeholder) | ✓ SATISFIED | Form exists, presentational only as expected |
| LAND-04 (Manifesto: bold text, 3 phase cards) | ✓ SATISFIED | renderBold function verified |
| LAND-05 (Judging: 5 criteria bars, 5 prizes) | ✓ SATISFIED | All truths verified |
| LAND-06 (Hubs: city map, ambassador pitch, form) | ⚠️ PARTIAL | Component exists but missing id="hubs" for navigation |
| LAND-07 (Sponsors: 3 metrics, 3 props, 2 CTAs) | ✓ SATISFIED | All truths verified |
| LAND-08 (FAQ: 4 accordion items) | ✓ SATISFIED | Native details/summary verified |
| LAND-09 (Footer: logos, links, contact) | ⚠️ PARTIAL | Footer exists but links to #hero (should be #register) |
| LAND-11 (Bilingual content from URL locale) | ✓ SATISFIED | Translation system verified |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `Hubs.tsx` | 58 | TODO comment | ℹ️ Info | Intentional phase marker - "Phase 3 — expand form, Phase 4 — Server Action" |
| `Hero.tsx` | 102 | TODO comment | ℹ️ Info | Intentional phase marker - "Phase 4" for submit handler |
| `Sponsors.tsx` | 49, 56 | href="#" placeholders | ℹ️ Info | Expected - sponsor deck and call links will be real URLs in production |
| `Footer.tsx` | 49, 65, 81 | href="#" placeholders | ℹ️ Info | Expected - social links will be real URLs once decided |

**No blocker anti-patterns found.** All TODO comments are intentional phase markers, not missing implementations.

### Human Verification Required

#### 1. Navbar Scroll Behavior

**Test:** Open http://localhost:3000/es/ in a browser. Scroll down slowly, then scroll up.

**Expected:**
- Scrolling down: Navbar slides up and disappears (translateY(-100%))
- Scrolling up: Navbar slides down and reappears
- After scrolling past 50px: Navbar background becomes opaque with backdrop blur
- Before 50px scroll: Navbar background is transparent

**Why human:** Visual animation behavior and timing can't be verified programmatically.

#### 2. Language Toggle

**Test:** Click ES/EN buttons in Navbar.

**Expected:**
- URL changes from /es/ to /en/ (or vice versa)
- All section content updates to the new language
- Active language button is bold, inactive is muted
- Page does not scroll to top (scroll: false in router.replace)

**Why human:** Client-side routing behavior and visual language updates require human observation.

#### 3. Mobile Menu

**Test:** Resize browser to mobile width (~375px). Tap hamburger icon.

**Expected:**
- Desktop nav links hide, hamburger icon appears
- Tapping hamburger opens drawer with all nav links + language switcher + register CTA
- Tapping a link closes drawer and scrolls to section
- Tapping hamburger again closes drawer

**Why human:** Mobile responsive behavior and touch interactions require human testing.

#### 4. Anchor Navigation (WITH GAPS)

**Test:** Click navigation links in Navbar: "How It Works", "Prizes", "FAQ", "Sponsors".

**Expected:**
- Page scrolls to target section with correct offset (not hidden behind navbar)
- Scroll behavior is smooth (CSS scroll-behavior: smooth)

**Known issues:**
- Clicking "Hubs" in Navbar will NOT scroll (missing id="hubs")
- Clicking "Register" in Footer will NOT scroll (links to #hero but should link to #register)

**Why human:** Scroll animation and positioning require visual verification. Gaps need fixing before full verification.

#### 5. FAQ Accordion

**Test:** Click/tap each FAQ question.

**Expected:**
- Details element expands/collapses (native HTML behavior, no JS required)
- Chevron icon rotates 180deg when expanded
- Smooth height transition
- No layout shift

**Why human:** Native details animation and visual smoothness require human observation.

#### 6. Form Presentation

**Test:** View Hero registration form and Hubs ambassador button.

**Expected:**
- Hero form inputs are styled but non-functional (clicking submit does nothing)
- Hubs "Apply to Host a Hub" button is visible but does nothing (Phase 3/4 scope)
- No console errors

**Why human:** Non-functional forms need visual confirmation they appear correct despite being inactive.

#### 7. Bilingual Content Completeness

**Test:** Visit /es/ and /en/ routes, scroll through all sections.

**Expected:**
- All text content displays correctly in both languages
- No missing translations (no translation keys visible like "navbar.challenge")
- Accent characters render correctly (Spanish: á, é, í, ó, ú, ñ)
- No layout breaks due to longer text in one language

**Why human:** Content quality and visual completeness require human review.

### Gaps Summary

**2 gaps blocking full goal achievement:**

1. **Missing Hubs anchor ID** — Navbar links to `#hubs` but Hubs.tsx root `<div>` has no id attribute. User clicking "Hubs" link sees no scroll behavior.

   **Fix:** Add `id="hubs"` to the root div in Hubs.tsx (line 17).

2. **Footer links to wrong anchor** — Footer nav links to `#hero` but Hero section uses `id="register"`. User clicking "Register" link in Footer sees no scroll behavior.

   **Fix:** Change Footer href from `#hero` to `#register` (line 21), OR add `id="hero"` to Hero section as a secondary ID.

**These are minor wiring issues, not missing implementations.** All components are fully implemented and substantive. Fixing these gaps is trivial (add 2 ID attributes or change 1 href).

---

_Verified: 2026-02-14T03:35:19Z_  
_Verifier: Claude (gsd-verifier)_
