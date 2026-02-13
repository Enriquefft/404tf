# Project Research Summary

**Project:** SpecHack — Hackathon Landing Page
**Domain:** Vite/React SPA to Next.js 16 App Router migration
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

SpecHack is a hackathon landing page with a unique trading card identity system that needs migration from Vite/React SPA to Next.js 16 App Router. The migration enables two critical features impossible in a static SPA: DB-backed sequential agent numbers and dynamic OG images for viral social sharing. The recommended approach is an incremental migration following Next.js App Router patterns: server-first components with strategic client boundaries, next-intl for bilingual routing, and Drizzle ORM with the existing Neon Postgres monorepo database.

The key technical risk is the "Client Component Cascade" — developers migrating from React Router SPAs instinctively mark everything with "use client", eliminating Next.js SSR benefits and causing performance regression below the Vite baseline. This must be mitigated from Phase 1 by establishing a server-first pattern with clear component boundaries. Additional critical risks include Framer Motion hydration errors, Canvas API SSR crashes, and Tailwind v4 syntax breaking changes.

The migration is highly feasible because the monorepo already proves the stack (Next.js 16.1.6, React 19.2, next-intl 4.8.2, Drizzle ORM, Tailwind v4.0.x pinned) in the landing app. The research has HIGH confidence across all areas, with known gotchas already documented in project CLAUDE.md and MEMORY.md. The recommended phase structure prioritizes foundation setup (routing, database, styles) before migrating static content, then layering interactivity (forms, animations), and finally adding the differentiators (trading cards, dynamic OG images).

## Key Findings

### Recommended Stack

Next.js 16 App Router with React 19.2 forms the core framework, providing Server Components, built-in OG image generation, and Turbopack as default bundler. The monorepo pattern is proven with the landing app using identical versions. Critical constraint: Tailwind CSS must be pinned to ~4.0.0 due to a CRITICAL BUG in v4.1.18 with Next.js 16 Turbopack that throws `RangeError: Invalid code point` during build. Bun 1.x provides 28% faster performance than Node.js for Next.js and has native Vercel support, though known issues exist with versions 1.3.2-1.3.6 and Next.js 16.1.2.

**Core technologies:**
- **Next.js 16.1.6 + React 19.2**: App Router with Server Components, native OG image generation — proven in landing app, latest stable versions
- **next-intl 4.8.2**: Next.js-native i18n with Server Components support, SEO-friendly URL prefixing — established monorepo pattern
- **Drizzle ORM + Neon Postgres**: TypeScript-first ORM with edge-compatible drivers, shared via @404tf/database package — single source of truth for schema
- **Tailwind v4.0.x (pinned)**: Utility-first CSS, must avoid v4.1.18+ Turbopack bug — monorepo uses 4.0.7 successfully
- **Framer Motion 12.34.0**: React 19.2 compatible animations, must wrap in client components — proven landing app pattern
- **Zod 4.3.6**: Schema validation for Server Actions — security-critical input validation standard

**Supporting patterns:**
- Translation prop-drilling: Server Components call getTranslations(), pass strings as props to client components (no runtime dictionary lookups)
- useActionState for forms: Built-in React 19 pattern for Server Actions with automatic pending state handling
- Canvas API client-only: Dynamic import with ssr: false for browser-side PNG export
- ImageResponse for OG images: Built-in next/og with Satori rendering (flexbox only, 500KB bundle limit)

### Expected Features

The migration from Vite/React SPA brings most UI features already built, but Next.js enables two critical new capabilities: DB-backed persistent registrations and dynamic OG images for social sharing.

**Must have (table stakes):**
- Registration form (name, email, city, track) — core hackathon requirement, expected on landing page
- Event details (dates, location, format) — users need context before registering
- FAQ section (accordion pattern) — addresses cost, eligibility, rules questions
- About/Vision + Code of Conduct — builds trust and community safety
- Sponsors section — credibility and professional legitimacy
- Mobile responsive — 40%+ traffic, critical for registration form
- Clear primary CTA — "Register Now" must be unambiguous

**Should have (competitive differentiators):**
- Trading card identity system — gamified registration, shareable identity cards with 6 builder classes (AI/Biotech/Hardware)
- Sequential agent numbers — DB-backed, creates scarcity/FOMO ("I'm #42!"), collectibility incentive
- Dynamic OG images — /c/[name]/opengraph-image shows personalized card on social shares, drives viral growth
- Canvas PNG export — participants download high-res cards for social media sharing
- Challenge page permalinks — /c/[name] creates public profile without login, lowers friction for viral recruitment
- Bilingual ES/EN — accessible to Spanish-speaking LATAM participants (table stakes for LATAM events)
- Deterministic card generation — same name always generates same card, enables shareable permalinks

**Defer (v2+):**
- Team formation tools — can use external Discord/Slack
- Project submission portal — separate phase after hackathon starts
- Email notifications — nice-to-have for confirmation, not critical for launch
- Admin dashboard — can manage via Drizzle Studio for MVP
- Real-time availability counter ("Join 142 builders") — requires DB query, adds complexity

**Anti-features to avoid:**
- Multi-step registration wizard — increases abandonment
- Account creation requirement — friction barrier, cards are for viral sharing
- Random card generation — breaks shareability, permalinks become useless
- Generic OG images — missed viral opportunity
- Edit/delete card after creation — adds auth complexity for minimal value

### Architecture Approach

Next.js 16 App Router architecture with server-first rendering and strategic client boundaries. Server Components handle static content sections (Hero, Manifesto, Judging, Hubs, Sponsors, FAQ) and pass translated strings as props to client components. Client components are isolated to three categories: navigation UI (language toggle, mobile menu), animations (Framer Motion wrappers via children prop pattern), and browser APIs (Canvas export, form state). Database operations use Server Actions called via useActionState hook, with Zod validation and FormState return objects. The @404tf/database workspace package provides shared Drizzle schema with spechack_ enum prefix, ensuring type safety and single source of truth across monorepo.

**Major components:**
1. **Navbar (Client)** — language toggle, mobile menu, scroll-aware background; requires useState and browser events
2. **Static Content Sections (Server)** — Hero, Manifesto, Judging, Hubs, Sponsors, FAQ; fetch translations server-side, wrap in FadeInSection animation wrappers
3. **RegistrationForm (Client)** — useActionState integration with registerParticipant Server Action, Zod validation, FormState error handling
4. **Trading Card System** — deterministic hash-based generation (Server), CardExport with Canvas API (Client), CardReveal animation (Client wrapper)
5. **Challenge Routes** — /[locale]/c/[name]/page.tsx queries DB for existing participant, /[locale]/c/[name]/opengraph-image.tsx generates dynamic OG image via ImageResponse
6. **Animation Wrappers (Client)** — FadeInSection, CardReveal using Framer Motion; static Server Component children passed via children prop
7. **Database Layer (Shared Package)** — @404tf/database with spechack_participants table, Neon Postgres connection, Drizzle ORM queries

**Critical patterns:**
- Server-first content, client-wrapped animations: Static sections rendered as Server Components, wrapped in client animation components via children prop
- Translation prop-drilling: Server fetches translations, passes individual strings as props (not entire dictionaries)
- useActionState for forms: Direct server function calls with type safety, automatic pending state
- Dynamic OG images via ImageResponse: Server-rendered PNG at /c/[name]/opengraph-image with flexbox-only layouts
- Canvas client-only: Dynamic import with ssr: false, isolated to CardExport component
- Shared database package: Single source of truth for schema, types synced automatically

### Critical Pitfalls

**Top 5 pitfalls with prevention strategies:**

1. **Client Component Cascade (The "use client" Pandemic)** — Developers mark every component with "use client" because they're used to React Router SPAs, sending unnecessary JavaScript and eliminating SSR benefits. **Prevention:** Default to Server Components, only add "use client" for browser APIs/hooks/events. Create wrapper components for interactive parts. Measure bundle size with @next/bundle-analyzer. Establish this pattern in Phase 1 foundation.

2. **Framer Motion in Every Component** — Importing motion.div directly in Server Components causes "motion.div is not defined" errors. Developers then mark every animated component as client, cascading to Pitfall #1. **Prevention:** Create motion wrapper components ONCE in src/components/motion.tsx ("use client"). Import wrappers, not motion directly. Keep animation config in Server Components passed as props. Set up wrappers BEFORE migrating first animation.

3. **Canvas API Hydration Mismatch** — Canvas rendering runs during SSR, accesses document.createElement('canvas'), crashes with "document is not defined" or causes hydration errors. **Prevention:** Use dynamic imports with ssr: false and loading placeholder. Guard with typeof window checks. Separate Canvas logic from component, import dynamically. Canvas must be client-only from day 1 in Phase 4.

4. **localStorage as State Source of Truth** — Migrating localStorage.getItem() directly causes "localStorage is not defined" SSR errors, hydration mismatches, flash of wrong content. **Prevention:** Move state to database (Next.js enables backend). Use cookies for persistence (available server + client). Defer localStorage reads to useEffect. Consider migration an opportunity for proper auth + database.

5. **Tailwind v4 @apply with Theme Variables Fails** — Code like @apply bg-[--house-ai] breaks in Tailwind v4 with "Cannot use @apply with theme variables" error due to fundamental CSS variable handling changes. **Prevention:** Use direct CSS with @theme declarations. Declare theme variables properly with @theme block. Avoid @apply in v4. Landing app already documented this gotcha in CLAUDE.md.

**Additional migration pitfalls:**
- React Router hash links don't work (use Next.js Link with hash support, manual scrollIntoView)
- Tailwind v4 class renames break styles silently (run npx @tailwindcss/upgrade, manual review)
- next-intl LanguageContext doesn't map to URL routing (use next-intl routing API, set up proxy.ts at src/proxy.ts)
- Dynamic OG image font loading breaks in production (use absolute paths with process.cwd(), verify in production mode)
- Environment variables need NEXT_PUBLIC_ prefix (rename VITE_ → NEXT_PUBLIC_)

## Implications for Roadmap

Based on research, suggested phase structure follows dependency order and pitfall mitigation:

### Phase 1: Foundation
**Rationale:** Must establish correct patterns (server-first components, motion wrappers, Tailwind v4 config) before any migration work. Wrong choices here cascade through entire codebase.
**Delivers:** Monorepo setup, next-intl routing with proxy.ts, shared database schema (spechack_participants table), global styles with Tailwind v4 @theme declarations, motion wrapper components
**Addresses:** Infrastructure requirements, prevents Client Component Cascade (Pitfall #1), prevents Framer Motion cascade (Pitfall #2), prevents Tailwind v4 @apply failures (Pitfall #5)
**Avoids:** "Big Bang" migration anti-pattern, Tailwind v4.1.18 Turbopack bug, environment variable prefix errors

### Phase 2: Static Content Migration
**Rationale:** Migrate existing Vite sections as Server Components, establish translation prop-drilling pattern, test routing and i18n before adding interactivity.
**Delivers:** Navbar (Client), Footer (Server), Hero (Server shell), Manifesto/Judging/Hubs/Sponsors/FAQ (Server sections)
**Uses:** next-intl getTranslations() server-side, motion wrappers from Phase 1
**Implements:** Server-first architecture, translation prop-drilling pattern
**Avoids:** Hash navigation breaks (use Next.js Link), Tailwind v3 → v4 class renames (run upgrade tool), next-intl Context → URL routing mismatch

### Phase 3: Animations & Interactivity
**Rationale:** Layer animations and form handling after static content proven. Wrap sections in FadeInSection, implement Server Actions for forms.
**Delivers:** FadeInSection animation wrapper, CardReveal animation, wrap static sections, Accordion for FAQ (custom Tailwind v4 component)
**Uses:** Motion wrappers from Phase 1, useActionState for forms
**Implements:** Scroll-triggered animations, Server Actions with Zod validation
**Avoids:** Framer Motion in every component (use wrappers), API routes for forms (use Server Actions)

### Phase 4: Forms & Database Integration
**Rationale:** Depends on Phase 1 database schema and Phase 3 animation patterns. Enables DB-backed registrations with persistent agent numbers.
**Delivers:** Registration Server Action (validation with Zod), RegistrationForm (Client with useActionState), Ambassador Server Action + Form
**Uses:** @404tf/database Drizzle schema, useActionState pattern
**Implements:** DB-backed sequential agent numbers, form validation, FormState error handling
**Avoids:** localStorage as state source (use database), duplicate registrations (check email), sequential ID exposure (acceptable for hackathons)

### Phase 5: Trading Cards & Canvas Export
**Rationale:** Depends on Phase 4 registration system. Deterministic card generation uses registration data, Canvas export requires client-side rendering.
**Delivers:** Card generation logic (deterministic hash → gradient + class), TradingCardDisplay (Server), CardExport with Canvas API (Client with ssr: false), CardReveal integration after registration
**Uses:** Canvas API with dynamic import, motion wrappers for reveal
**Implements:** Deterministic card generation, browser-side PNG download
**Avoids:** Canvas API hydration mismatch (dynamic import with ssr: false, loading placeholder), Canvas rendering on every render (useEffect with dependencies)

### Phase 6: Challenge Routes & Dynamic OG Images
**Rationale:** Depends on Phase 5 trading card system. Creates shareable permalinks and viral growth mechanism via personalized social previews.
**Delivers:** Challenge page route (/[locale]/c/[name]/page.tsx), Challenge OG image route (opengraph-image.tsx with ImageResponse), dynamic metadata with participant name
**Uses:** next/og ImageResponse, Drizzle DB queries by name, nested dynamic routes with next-intl
**Implements:** Dynamic OG images, shareable challenge permalinks, viral social sharing
**Avoids:** OG image font loading failures (absolute paths, test in production mode), CSS Grid in OG images (flexbox only), large OG image bundles (500KB limit)

### Phase 7: Polish & Edge Cases
**Rationale:** After core features proven, add UX polish and error handling. Non-blocking for launch.
**Delivers:** StickyRegisterButton (scroll-triggered floating CTA), error boundaries for DB failures, loading states with Suspense, social proof counter (optional)
**Uses:** Client scroll events, Next.js error boundaries, Suspense
**Implements:** UX polish, graceful degradation
**Avoids:** Feature overload on CTA (single primary action), leaderboard competitive rankings (use social proof count only)

### Phase Ordering Rationale

- **Phase 1 must come first:** Foundation setup prevents architectural mistakes that cascade. Server-first pattern, motion wrappers, and Tailwind v4 config are prerequisites for all later work.
- **Phase 2-3 before Phase 4:** Static content and animations must work independently before adding database complexity. Validates routing, i18n, and component patterns.
- **Phase 4 enables Phase 5:** Trading cards require registration system for agent numbers and user data.
- **Phase 5 enables Phase 6:** Challenge routes need trading card system to generate previews. Dynamic OG images render trading cards.
- **Phase 7 is optional polish:** Can deploy after Phase 6 with core viral growth loop complete.
- **Migration order respects pitfall timing:** Phase 1 prevents Component Cascade and Framer Motion cascade. Phase 5 handles Canvas hydration. Phase 6 addresses OG image font loading.

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Well-documented Next.js setup, monorepo patterns proven in landing app, known gotchas in CLAUDE.md
- **Phase 2 (Static Content):** Standard Server Component migration, next-intl proven in landing app
- **Phase 3 (Animations):** Framer Motion patterns proven in landing app, useActionState is React 19 standard
- **Phase 4 (Forms):** Server Actions + Zod validation proven in landing app, Drizzle ORM established
- **Phase 5 (Trading Cards):** Canvas API is standard browser API, deterministic generation is algorithmic
- **Phase 7 (Polish):** Standard UX patterns, error boundaries and Suspense are Next.js built-in

**Phases likely needing deeper research during planning:**
- **Phase 6 (Challenge Routes):** Dynamic OG image generation with ImageResponse is new for this project. Font loading pitfalls documented but need testing in production mode. Nested dynamic routes with next-intl less proven. Recommend phase-specific research for OG image optimization strategies and font embedding patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified in monorepo via bun pm ls, critical bugs documented (Tailwind v4.1.18, Bun 1.3.2-1.3.6), landing app proves entire stack |
| Features | HIGH | Table stakes identified from MLH hackathon guide + community best practices, differentiators derived from existing Vite app, anti-features based on landing page mistakes research |
| Architecture | HIGH | Server/Client component patterns from official Next.js docs, proven monorepo patterns from landing app, community best practices for 2026 confirmed |
| Pitfalls | HIGH | Migration-specific pitfalls from official Next.js migration guide + 2026 community reports, hydration errors documented extensively, Tailwind v4 gotchas proven in monorepo |

**Overall confidence:** HIGH

Research is comprehensive with official documentation verification, monorepo pattern proof, and 2026-current community validation. The landing app provides working reference for 90% of stack choices. Known gotchas are already documented in project CLAUDE.md and MEMORY.md. The main risk is execution discipline (maintaining server-first pattern, avoiding "use client" cascade), not technical unknowns.

### Gaps to Address

**Minimal gaps identified. Areas needing attention during implementation:**

- **Bun version stability:** Known issues with 1.3.2-1.3.6 + Next.js 16.1.2. Mitigation: Use Bun 1.x with vercel.json config, let Vercel manage minor version, monitor GitHub issues for updates. Test in Vercel preview environment early.

- **Dynamic OG image optimization:** ImageResponse bundle size limit (500KB) and Satori CSS support (flexbox only, no calc/Grid) are constraints. Mitigation: Design cards with flexbox layouts, test OG image routes in production mode early (Phase 6), use Twitter Card Validator for testing.

- **Sequential agent numbers at scale:** Postgres SERIAL for sequential IDs works for hackathon scale (100-10K participants) but needs consideration for 10K+ registrations. Mitigation: Start with SERIAL (simple, human-readable), add indexes on name/email queries. At 10K+ scale, consider caching frequently accessed cards in Redis or pre-generating OG images.

- **next-intl use cache limitation:** `use cache` directive doesn't work seamlessly with next-intl yet (awaiting next/root-params API). Mitigation: Skip `use cache` for now, not critical for MVP. Re-evaluate when Next.js ships next/root-params API.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) — Core framework features and React 19 compatibility
- [Next.js 16 Upgrading Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — Migration paths and breaking changes
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — Architecture patterns and boundaries
- [Next.js: Forms and Server Actions](https://nextjs.org/docs/app/guides/forms) — useActionState and Server Action patterns
- [Next.js Metadata Files: OG Images](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) — ImageResponse API and constraints
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 architecture and CSS-first approach
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — Breaking changes and migration steps
- [next-intl Documentation](https://github.com/amannn/next-intl) — Routing setup and Server Component integration
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — Database integration patterns
- [Vite to Next.js Migration Guide](https://nextjs.org/docs/app/guides/migrating/from-vite) — Official migration checklist
- [Main Website - Hackathon Organizer Guide (MLH)](https://guide.mlh.io/general-information/hackathon-website/main-website) — Table stakes features for hackathon landing pages

### Secondary (MEDIUM confidence)
- [Tailwind CSS v4.1.18 + Next.js 16 Turbopack Build Failure](https://github.com/vercel/next.js/discussions/88443) — Critical bug documentation
- [Bun 1.3.6 not working with Next.js 16.1.2](https://github.com/oven-sh/bun/issues/26165) — Runtime compatibility issues
- [App Router Pitfalls (2026-02-11)](https://imidef.com/en/2026-02-11-app-router-pitfalls) — Common migration mistakes
- [Next.js Hydration Errors 2026](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702) — Canvas and localStorage pitfalls
- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) — Animation wrapper patterns
- [Generate Dynamic OG Images with Next.js 16](https://makerkit.dev/blog/tutorials/dynamic-og-image) — ImageResponse best practices
- [Implementing Next.js 16 'use cache' with next-intl](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/) — next-intl limitations
- [7 Strategies for Assigning Ids](https://simpleorientedarchitecture.com/7-strategies-for-assigning-ids/) — Sequential ID considerations
- [Tailwind v4 Complete Guide 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) — @apply and @theme patterns

### Tertiary (Monorepo Verification)
- Project CLAUDE.md — Documented gotchas: Tailwind v4 @apply failures, proxy.ts location, Biome config
- Project MEMORY.md — Proven patterns from landing app: next-intl routing, Drizzle ORM, Framer Motion wrappers
- Monorepo package.json versions — Verified via bun pm ls: Next.js 16.1.6, React 19.2, next-intl 4.8.2, Tailwind 4.0.7, Drizzle 0.45.1

---
*Research completed: 2026-02-13*
*Ready for roadmap: yes*
