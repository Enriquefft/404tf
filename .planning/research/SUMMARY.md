# Project Research Summary

**Project:** 404 Tech Found Landing Page Migration
**Domain:** Deeptech pre-incubator landing page (Vite/React SPA to Next.js 16 SSR)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

This project migrates an existing Vite/React SPA landing page for the 404 Tech Found deeptech pre-incubator to Next.js 16 with App Router, adding SSR for SEO, bilingual i18n (ES/EN), GEO optimization for AI discoverability, and a database-backed intent form. The existing content and design are already built -- this is a framework migration, not a greenfield build. The recommended approach uses a server-first architecture with client islands: React Server Components handle all static content (hero, features, social proof), while small Client Component wrappers handle interactivity (Framer Motion animations, TanStack Forms, scroll state). This pattern maximizes SEO by shipping minimal JavaScript to the browser.

The stack is mature and well-documented. Next.js 16 with Turbopack, Bun, Tailwind v4, next-intl, Drizzle ORM with Neon serverless Postgres, and Biome for linting form a cohesive, high-performance foundation. All packages have verified compatibility with React 19.2 and each other. The only integration friction is between next-intl and Next.js 16's "use cache" directive, which has a documented workaround. The migration from middleware.ts to proxy.ts (a Next.js 16 rename) is straightforward but easy to miss.

The primary risks are: (1) incorrect RSC/Client component boundaries that bloat the JS bundle and negate SSR benefits, (2) Framer Motion hydration errors from importing motion components into Server Components, and (3) the Tailwind v3-to-v4 syntax migration breaking styles silently. All three are preventable with disciplined phase ordering -- establish the i18n routing, component boundary strategy, and Tailwind v4 setup before migrating any sections.

## Key Findings

### Recommended Stack

The stack centers on Next.js 16.1.6+ with App Router, React 19.2, and Bun as runtime and package manager. All core technologies have HIGH confidence compatibility ratings verified against official sources and npm registries. See `STACK.md` for full version matrix and installation commands.

**Core technologies:**
- **Next.js 16 + React 19**: SSR framework with App Router, automatic metadata management, Turbopack for 2-5x faster builds
- **Bun 1.3.8+**: 25x faster package installation, drop-in Node.js replacement, production-ready
- **Tailwind CSS v4**: 3.78x faster builds, zero-config, CSS-first configuration via @theme
- **next-intl 4.8.2+**: Native Next.js 16 support for type-safe translations and locale-based routing
- **Drizzle ORM + Neon**: Serverless-first ORM with HTTP driver for edge/serverless, auto-scaling Postgres
- **TanStack Form + Zod**: Type-safe form handling with shared validation schemas across client/server
- **Biome 2.3+**: Single tool replacing ESLint + Prettier, 56x faster
- **PostHog**: Analytics with native App Router integration, feature flags, session recordings
- **shadcn/ui**: RSC-compatible component library, no runtime dependency overhead
- **Framer Motion 12.33+**: React 19 compatible animation library

**Critical version notes:**
- Tailwind v4.1.18 has a known Turbopack build failure -- pin to v4.0.7 if hit
- PostHog requires 2026-01-30+ config to avoid React hydration issues
- next-intl "use cache" incompatibility requires avoiding cache on translated components until root-params API ships

### Expected Features

The feature research divided capabilities into table stakes, differentiators, and anti-features. See `FEATURES.md` for the full prioritization matrix and dependency map.

**Must have (v1 -- table stakes):**
- Mobile-responsive design (60%+ traffic is mobile, Google mobile-first indexing)
- Core Web Vitals optimization (LCP <2.5s, INP <200ms, CLS <0.1)
- Schema.org Organization markup (JSON-LD)
- XML sitemap + robots.txt
- Meta titles and descriptions (unique per page, per locale)
- hreflang tags for ES/EN bilingual SEO
- Single focused CTA with intent-based lead form (Build/Collaborate/Connect)
- Social proof section (traction bar, partner logos, testimonials)
- Language switcher with URL-based routing

**Should have (v1.x -- differentiators):**
- llms.txt + llms-full.txt for AI discoverability (ChatGPT, Claude, Perplexity)
- Structured FAQ markup (FAQPage schema for featured snippets)
- Event schema markup (rich results for hackathons/summits)
- Open Graph + Twitter Cards for social sharing
- Community showcase / alumni profiles

**Defer (v2+):**
- Real-time stats/traction (static snapshots suffice)
- Blog/content hub (requires ongoing production)
- A/B testing framework (need baseline traffic first)
- Marketing automation integration
- Progressive web app features

**Anti-features to avoid:**
- Multiple competing CTAs (causes choice paralysis)
- Auto-play video/audio (hurts Core Web Vitals)
- Chatbot on landing page (distracts from CTA)
- Pop-ups on entry (Google penalties for intrusive interstitials)

### Architecture Approach

The architecture follows a server-first pattern with client islands, using Next.js 16 App Router with a `[locale]` dynamic segment for i18n routing. All pages and layouts are Server Components by default. Client Components are used only at interaction boundaries: navbar (scroll state), intent form (TanStack Forms), traction bar (count-up animation), and Framer Motion wrappers. See `ARCHITECTURE.md` for the full project structure and data flow diagrams.

**Major components:**
1. **App Router layer** (`app/[locale]/`) -- Locale-based routing via next-intl, root and locale layouts, page entry points
2. **Section components** (`components/sections/`) -- Landing page sections, split between Server (static content) and Client (interactive) components
3. **Data layer** (`db/`, `lib/actions.ts`) -- Drizzle ORM schema, Neon serverless connection, Server Actions for form mutations
4. **i18n layer** (`i18n/`, `messages/`) -- next-intl configuration with separate Server (getTranslations) and Client (useTranslations) APIs
5. **Provider layer** (`components/providers/`) -- PostHog analytics provider, theme provider -- all Client Components wrapping Server Component children

**Key architectural decisions:**
- `proxy.ts` replaces `middleware.ts` in Next.js 16 (Node.js runtime only, no Edge)
- Server Actions replace API routes for all internal mutations
- `localePrefix: 'as-needed'` hides /en prefix for default locale
- Environment validated at build time via @t3-oss/env-nextjs imported in next.config.ts

### Critical Pitfalls

The migration has 8 documented pitfalls. The top 5 with highest impact are listed here. See `PITFALLS.md` for all 8 with code examples and recovery strategies.

1. **Incorrect RSC/Client boundaries** -- Push `'use client'` down to the smallest interactive leaf. Never mark layouts or large sections as Client Components. Use `server-only` package to prevent accidental secret leaks. Recovery cost: MEDIUM.

2. **Framer Motion hydration errors** -- Create dedicated Client Component wrappers for all motion usage. Use `dynamic(() => import(...), { ssr: false })` for complex scroll animations. Never import `motion` directly in Server Components. Recovery cost: LOW.

3. **Tailwind v4 syntax migration** -- Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`. Update deprecated utilities (`bg-opacity-20` to `bg-black/20`, `!flex` to `flex!`). Add explicit border colors (default changed from gray-200 to currentColor). Run `npx @tailwindcss/upgrade` first. Recovery cost: LOW.

4. **LanguageContext to next-intl migration** -- Remove the existing custom LanguageContext entirely. Use next-intl's routing-based approach with `[locale]` segments. Different APIs for Server (`getTranslations`) vs Client (`useTranslations`) components. Must be done before any page migration. Recovery cost: HIGH if retrofitted late.

5. **Drizzle connection pooling in serverless** -- Use `neon-http` driver (stateless, no pooling needed) instead of TCP/WebSocket. Create module-level singleton, never instantiate per-request. Recovery cost: HIGH if hit in production.

## Implications for Roadmap

Based on combined research, the migration should proceed in 5 phases ordered by dependency chain and risk. The i18n and Tailwind setup must come first because every subsequent component depends on them. Static sections come before interactive ones because they are simpler and validate the RSC pattern. The data layer comes after components because only the intent form needs it. SEO metadata and analytics come last because they depend on content being in place.

### Phase 1: Foundation

**Rationale:** Everything depends on the build system, i18n routing, and styling being correct. These are blocking dependencies that cannot be parallelized with component work. Establishing RSC/Client boundaries here prevents the most critical pitfall.
**Delivers:** Working Next.js 16 project that renders an empty locale-routed page with Tailwind v4 styles, validated environment variables, and database connection.
**Addresses:** Mobile-responsive design foundation, i18n routing, hreflang infrastructure
**Avoids:** Pitfall 1 (RSC boundaries), Pitfall 3 (LanguageContext migration), Pitfall 4 (Tailwind v4 syntax), Pitfall 7 (Drizzle connection pooling)

Build order:
1. Next.js 16 project initialization with Bun
2. @t3-oss/env-nextjs environment validation
3. Tailwind v4 + PostCSS + shadcn/ui initialization
4. next-intl configuration (routing.ts, request.ts, proxy.ts, message files)
5. Root layouts (app/layout.tsx, app/[locale]/layout.tsx)
6. Drizzle ORM + Neon connection (db/schema.ts, db/index.ts)
7. Biome + Lefthook + commitlint setup

### Phase 2: Static Content Migration (Server Components)

**Rationale:** Migrating static sections first validates the RSC pattern and produces visible progress. These sections have zero interactivity and translate directly to Server Components with next-intl translations. This is the highest-confidence phase.
**Delivers:** Full landing page with all static content rendered server-side in both ES and EN.
**Uses:** next-intl getTranslations, shadcn/ui components, Tailwind v4
**Implements:** Server Components for Hero, Features, Testimonials, Social Proof, Footer, About sections
**Avoids:** Pitfall 5 (Route Handler misuse -- no data fetching needed for static content)

### Phase 3: Interactive Components (Client Components)

**Rationale:** Interactive sections depend on the static foundation being in place. This phase adds `'use client'` boundaries for animations, forms, and scroll state. The intent form requires the database schema from Phase 1 and Server Actions.
**Delivers:** Fully interactive landing page with animations, working intent form with database persistence, and responsive navbar.
**Uses:** Framer Motion 12.33+, TanStack Form + Zod, Server Actions, Drizzle ORM
**Implements:** Navbar (scroll), IntentCTA (form), TractionBar (count-up), AnnouncementBanner (dismiss), animation wrappers
**Avoids:** Pitfall 2 (Framer Motion hydration), Pitfall 8 (TanStack Forms validation gaps)

### Phase 4: SEO, Metadata, and Structured Data

**Rationale:** SEO features depend on content being in place. Dynamic OG images need translated content. JSON-LD needs page structure finalized. Sitemap generation needs all routes defined.
**Delivers:** Full SEO infrastructure -- structured data, dynamic OG images, sitemap, robots.txt, canonical URLs.
**Addresses:** Schema.org Organization markup, XML sitemap, robots.txt, meta titles/descriptions, canonical URLs, Open Graph + Twitter Cards
**Avoids:** Pitfall 6 (JSON-LD XSS -- sanitize from day one)

### Phase 5: Analytics, GEO, and Polish

**Rationale:** Analytics and AI discoverability are non-blocking enhancements that layer on top of the working site. PostHog can be added without affecting functionality. llms.txt is a static file that requires the content structure to be finalized.
**Delivers:** PostHog analytics integration, llms.txt + llms-full.txt for AI discoverability, Core Web Vitals verification, production readiness.
**Addresses:** PostHog events/tracking, llms.txt, Core Web Vitals optimization, performance audit
**Uses:** PostHog provider pattern (Client Component wrapping Server children)

### Phase Ordering Rationale

- **Dependency-driven:** i18n routing is a blocking dependency for every page render. Tailwind and environment setup are blocking for every component. These must be Phase 1.
- **Risk-front-loaded:** The 4 highest-risk pitfalls (RSC boundaries, Tailwind v4 syntax, LanguageContext migration, Drizzle connection) are all addressed in Phase 1. If Phase 1 succeeds, the remaining phases have LOW to MEDIUM risk.
- **Incremental validation:** Each phase produces a testable artifact. Phase 1: empty routed page. Phase 2: visible static content. Phase 3: interactive features. Phase 4: SEO scores. Phase 5: analytics data flowing.
- **Component architecture respected:** Static Server Components (Phase 2) before Client Components (Phase 3) follows the recommended "server-first, client-islands" pattern and prevents the common SPA migration mistake of making everything a Client Component.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** next-intl + Next.js 16 proxy.ts integration is new territory (middleware.ts rename). Verify exact proxy.ts configuration with latest next-intl docs.
- **Phase 3 (Interactive):** TanStack Forms + Server Actions integration is still POC-level maturity. May need to fall back to plain Server Actions with useActionState if integration proves brittle.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 2 (Static Content):** Standard RSC pattern, extensively documented in Next.js and next-intl official docs.
- **Phase 4 (SEO/Metadata):** generateMetadata API, JSON-LD, sitemap.ts, robots.ts all have official Next.js documentation and examples.
- **Phase 5 (Analytics/GEO):** PostHog has official Next.js App Router docs. llms.txt is a simple static file following a published standard.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via official docs, npm registries, and GitHub releases. Full compatibility matrix confirmed. |
| Features | HIGH | SEO/GEO features verified against 2026 sources, Google documentation, and competitor analysis. Feature priorities are clear. |
| Architecture | HIGH | Server-first with client islands is the official Next.js recommendation. Project structure follows next-intl App Router docs exactly. |
| Pitfalls | HIGH | All pitfalls sourced from official Vercel blog, Next.js docs, and verified community reports. Code examples provided for each. |

**Overall confidence:** HIGH

### Gaps to Address

- **Email service for form notifications:** No email service selected. Resend is recommended but not researched in depth. Decide during Phase 3 planning.
- **Rate limiting for intent form:** @upstash/ratelimit recommended but not included in stack. Add during Phase 3 if form spam is a concern.
- **Testing strategy:** No testing framework selected. Bun has built-in test runner; Vitest is the alternative. Defer decision to Phase 2 or later.
- **Error monitoring:** PostHog session recordings may suffice for MVP. Sentry is the alternative if deep error tracking is needed. Evaluate after launch.
- **Tailwind v4.1.18 Turbopack bug:** May be patched by implementation time. If not, pin to v4.0.7. Monitor GitHub discussion #19556.
- **@t3-oss/env-nextjs + Next.js 16:** No explicit Next.js 16 docs yet (MEDIUM confidence). Pre-configured for all Next.js runtimes, so likely works. Verify during Phase 1.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) -- Framework features, React 19 compatibility, proxy.ts rename
- [Next.js Docs: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- RSC patterns, boundaries
- [Next.js Docs: Vite Migration Guide](https://nextjs.org/docs/app/guides/migrating/from-vite) -- Official migration path
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- Breaking changes, upgrade path
- [next-intl App Router Docs](https://next-intl.dev/docs/getting-started/app-router) -- i18n setup for Next.js 16
- [Drizzle ORM + Neon Guide](https://orm.drizzle.team/docs/connect-neon) -- Serverless driver setup
- [Vercel Blog: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) -- Pitfall patterns
- [Google Core Web Vitals Docs](https://developers.google.com/search/docs/appearance/core-web-vitals) -- SEO ranking factors

### Secondary (MEDIUM confidence)
- [PostHog Next.js App Router Docs](https://posthog.com/docs/libraries/next-js) -- Provider setup, hydration fix
- [TanStack Form Server Actions Example](https://tanstack.com/form/v1/docs/framework/react/examples/next-server-actions) -- Form + action integration
- [Aurora Scharff: next-intl + "use cache"](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/) -- Workaround for known incompatibility
- [GEO Guide: AI Search Optimization](https://gitbook.com/docs/guides/seo-and-llm-optimization/geo-guide) -- llms.txt standard
- [llms-txt.io](https://llms-txt.io/) -- llms.txt specification and generator

### Tertiary (LOW confidence)
- [shadcn/ui React 19 Docs](https://ui.shadcn.com/docs/react-19) -- Extrapolated from Next.js 15+ to Next.js 16 (no explicit v16 docs)
- [@t3-oss/env-nextjs npm](https://www.npmjs.com/package/@t3-oss/env-nextjs) -- No explicit Next.js 16 documentation yet

---
*Research completed: 2026-02-08*
*Ready for roadmap: yes*
