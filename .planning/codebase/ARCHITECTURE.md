# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** Next.js 16 App Router with monorepo structure supporting multiple applications (landing page, SpecHack) and shared packages. Component-driven architecture with server and client components, bilingual i18n, and form-to-database workflow.

**Key Characteristics:**
- Next.js 16 with App Router and Turbopack (--turbopack in dev)
- Monorepo with Bun workspaces (`apps/`, `packages/`)
- Bilingual routing with next-intl (always-prefix locale pattern)
- Server-first approach: async server components with minimal client boundaries
- Form submission via Next.js Server Actions (useActionState pattern)
- Database-driven metadata and dynamic content
- Framer Motion animations with intersection observer viewport detection

## Layers

**Route/Page Layer:**
- Purpose: Entry points for user navigation, locale-specific content generation
- Location: `apps/landing/src/app/[locale]/`
- Contains: Layout files (`layout.tsx`), page components (`page.tsx`), dynamic segments (`[...rest]`)
- Depends on: i18n/routing, components, translations, metadata
- Used by: Next.js router, middleware

**Component Layer:**
- Purpose: Presentational UI split between server and client components
- Location: `apps/landing/src/app/[locale]/_components/`
- Contains: Major sections (Hero, Navbar, IntentCTA, Houses, Programs, Events, Community, Partners, Footer), animations, Logo
- Depends on: Lucide icons, Framer Motion, Tailwind, translations, hooks, utils
- Used by: Page layouts, other components

**Animation Layer:**
- Purpose: Declarative animation abstractions using Framer Motion
- Location: `apps/landing/src/app/[locale]/_components/animations/`
- Contains: FadeInSection (scroll-triggered fade-in), FloatingMascot (parallax animation)
- Depends on: Framer Motion viewport detection, react-intersection-observer
- Used by: Page layout to wrap sections with reveal animations

**Server Actions Layer:**
- Purpose: Handle form submission, validation, and database persistence
- Location: `apps/landing/src/app/[locale]/_actions/`
- Contains: Form handlers (intent.actions.ts with submitIntent)
- Depends on: Zod schema validation, database client
- Used by: Client components via useActionState pattern

**Hooks Layer:**
- Purpose: Custom React hooks for client-side state and behavior
- Location: `apps/landing/src/hooks/`
- Contains: useScrollDirection (detects up/down scroll), useBannerHeight (dynamic top offset), useLocalStorage
- Depends on: React hooks only
- Used by: Client components (Navbar, banner-relative positioning)

**Internationalization Layer:**
- Purpose: Bilingual routing and content translation
- Location: `apps/landing/src/i18n/`
- Contains: routing.ts (locale config), navigation.ts (i18n navigation helpers), request.ts (request-scoped locale)
- Depends on: next-intl library
- Used by: Layouts, pages, components via getTranslations() server function

**Metadata/SEO Layer:**
- Purpose: Centralized SEO configuration and JSON-LD schema generation
- Location: `apps/landing/src/lib/metadata/`
- Contains: seo-config.ts (site URL, name, email, social links), json-ld/ (Event, FAQ, Organization schemas)
- Depends on: Next.js metadata API, React
- Used by: Page layouts for generateMetadata, root layout for schema markup

**Analytics Layer:**
- Purpose: PostHog integration for page view and web vitals tracking
- Location: `apps/landing/src/lib/analytics/`
- Contains: posthog-provider.tsx (client provider), posthog-pageview.tsx (manual pageview tracking), web-vitals.tsx (Core Web Vitals)
- Depends on: posthog-js library
- Used by: Root layout to wrap app with tracking

**Utilities Layer:**
- Purpose: Shared helper functions and class name utilities
- Location: `apps/landing/src/lib/utils.ts`
- Contains: cn() function (clsx + tailwind-merge for safe class composition)
- Used by: Components for className composition

**Database Layer:**
- Purpose: ORM and database connection management
- Location: `packages/database/src/`
- Contains: index.ts (Drizzle client), schema.ts (table definitions), env.ts (Zod validation for DATABASE_URL)
- Depends on: Drizzle ORM, Neon Postgres client, @t3-oss/env-nextjs
- Used by: Server actions for data persistence

**Configuration Layer:**
- Purpose: Shared TypeScript and linting configuration
- Location: `packages/config/`
- Contains: tsconfig.base.json (ESNext target, JSX preserve), biome.jsonc (linting rules)
- Used by: All apps and packages via extends/inheritance

**Styling Layer:**
- Purpose: Global styles, theme variables, and font loading
- Location: `apps/landing/src/styles/`
- Contains: globals.css (Tailwind v4 with @theme declarations, house colors, CSS variables), fonts.ts (Inter, Orbitron from Google Fonts)
- Depends on: Tailwind v4 (@tailwindcss/postcss), Next.js font loader
- Used by: Root layout, all components via classes

## Data Flow

**Page Render Flow:**

1. User requests `/es` or `/en`
2. Middleware (`src/proxy.ts`) validates locale and routes to `[locale]/page.tsx`
3. Server component calls `getLocale()` and `getTranslations()` for locale-specific content
4. Component tree renders: Hero → TractionBar → Houses → Programs → Events → Community → Partners → IntentCTA → Footer
5. Sections wrapped with FadeInSection for scroll-triggered animations
6. Client components (Navbar, IntentCTA, AnnouncementBanner) hydrate with translations prop-drilled from server

**Form Submission Flow:**

1. User fills IntentCTA form (name, email, intent: build/collaborate/connect)
2. Form action calls `submitIntent` Server Action via useActionState
3. Server Action parses FormData and validates with Zod schema
4. Valid data inserted into `intentSubmissions` table (Drizzle + Neon)
5. Server returns FormState (success: boolean, errors?, message)
6. Client updates UI: form → loading → success message (Framer Motion animated)

**Localization Flow:**

1. Routing middleware detects locale from URL segment `[locale]`
2. `NextIntlClientProvider` wraps app with active locale context
3. Server components call `getTranslations(namespace)` → returns i18n function
4. Strings fetched from `messages/{locale}.json` (es.json, en.json)
5. Client components receive pre-fetched translations as props (no runtime translation)
6. Language switcher in Navbar calls `router.replace(pathname, { locale })` to switch locale

**Analytics Flow:**

1. PostHog provider initializes on page load if env vars present
2. Manual pageview tracking via `PostHogPageView` component in root layout
3. Web Vitals component reports Core Web Vitals to PostHog
4. User interactions (scroll, form submit) auto-captured by PostHog SDK

**State Management:**

- **Minimal client-side state**: useActionState for form, useState for UI toggles (menu open, selected intent)
- **Server-driven data**: Translations fetched server-side, passed as props to client components
- **No global state library**: Context only used for PostHog provider
- **Form state**: Handled entirely by useActionState, FormState type controls validation feedback

## Key Abstractions

**Server Components (Async):**
- Purpose: Render static/precomputed content without hydration overhead
- Examples: `Hero`, `Houses`, `Programs`, `Events`, `Community`, `Partners`, `Footer`
- Pattern: `export async function ComponentName() { const t = await getTranslations(...); return <JSX />; }`
- Benefit: Translations resolved server-side, zero JS for display-only sections

**Client Components with Translation Props:**
- Purpose: Interactive components that need runtime state but localized text
- Examples: `Navbar`, `IntentCTA`, `AnnouncementBanner`
- Pattern: Server component calls `getTranslations()`, passes as `translations` object prop
- Benefit: Type-safe i18n without runtime dictionary lookups

**Scroll-Triggered Animations:**
- Purpose: Reveal sections on scroll without observing individual elements
- Implementation: `FadeInSection` wrapper uses Framer Motion `whileInView` with viewport margin
- Pattern: `<FadeInSection><Component /></FadeInSection>`
- Benefit: Single abstraction for staggered section reveals

**Form Server Actions with Validation:**
- Purpose: Safely handle form submission with Zod validation
- Pattern: Server Action receives FormData, validates shape, persists to DB, returns FormState
- Client integration: `useActionState<FormState, FormData>(submitIntent, null)`
- Type-safe: FormState discriminated union (success | error states)

**i18n Routing with Always-Prefix:**
- Purpose: Enforce locale in URL for canonical SEO and consistent UX
- Config: `localePrefix: "always"` in routing.ts
- Pattern: All routes are `/[locale]/page`, no default locale fallback
- Benefit: Hreflang alternates and canonical URLs automatically correct

**Middleware-Level i18n:**
- Purpose: Intercept requests and ensure locale validity
- Location: `src/proxy.ts` (Next.js 16 convention at same level as `app/`, not inside)
- Pattern: `createMiddleware(routing)` matches all non-API/non-static paths
- Benefit: Locale validation before component rendering

## Entry Points

**Root Layout:**
- Location: `apps/landing/src/app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Global CSS import, PostHog provider wrapper, font variable setup, HTML lang attribute

**Locale Layout:**
- Location: `apps/landing/src/app/[locale]/layout.tsx`
- Triggers: Locale-specific requests
- Responsibilities: Locale validation, metadata generation (title, OG tags, robots), NextIntlClientProvider setup

**Home Page:**
- Location: `apps/landing/src/app/[locale]/page.tsx`
- Triggers: `/[locale]` requests (es, en)
- Responsibilities: Compose section components, fetch locale-specific translations, render JSON-LD schemas

**Middleware/Proxy:**
- Location: `apps/landing/src/proxy.ts`
- Triggers: All non-API, non-static requests
- Responsibilities: Locale validation, route matching (matcher config)

**Special Routes:**
- `sitemap.ts`: Generates `/sitemap.xml` with bilingual alternates
- `robots.ts`: Generates `/robots.txt`
- `opengraph-image.tsx`: Dynamic OG image for social sharing
- `not-found.tsx`: Custom 404 page for invalid locales
- `error.tsx`: Error boundary for 5xx errors

## Error Handling

**Strategy:** Defensive validation at boundaries (Zod for forms, URL parsing for locale), graceful degradation for optional features (PostHog env vars optional)

**Patterns:**

**Form Validation Error:**
```typescript
// Server Action catches Zod SafeParseResult
const validation = intentSchema.safeParse(rawData);
if (!validation.success) {
  return { success: false, errors: validation.error.flatten().fieldErrors };
}
```
Client receives errors via FormState and displays inline feedback.

**Database Error:**
```typescript
try {
  await db.insert(intentSubmissions).values(validation.data);
  return { success: true, message: "success" };
} catch (error) {
  console.error("Database error:", error);
  return { success: false, message: "Database error. Please try again." };
}
```
Generic user message to avoid exposing DB details.

**Invalid Locale:**
```typescript
if (!hasLocale(routing.locales, locale)) {
  notFound(); // Returns 404
}
```
Triggers not-found.tsx page component.

**Missing PostHog Config:**
```typescript
if (!posthogKey || !posthogHost) {
  return <>{children}</>; // Gracefully skip provider
}
```
PostHog optional; app works without analytics.

## Cross-Cutting Concerns

**Logging:**
- Approach: console.error for critical failures (DB errors), no structured logging framework
- Used in: Server Actions, Server Components for debugging
- No logs persisted; relies on platform error tracking (if integrated)

**Validation:**
- Approach: Zod schema at form submission boundary
- Scope: Intent form only (name, email, intent enum)
- Client validation: None (rely on HTML5 attributes and server-side Zod)

**Authentication:**
- Approach: None implemented
- Assumption: Landing page is public; intent submissions stored anonymously (no user model)
- Future: Would be required for admin panel to view submissions

**Authorization:**
- Approach: None; all endpoints public
- Implication: POST endpoint for intent submission unauthenticated (potential spam risk)

**Caching:**
- Approach: Next.js default static generation for server components
- Pages marked with revalidate or ISR if needed (not currently configured)
- Translations fetched fresh per request (no caching layer)

**Security:**
- CSRF: Protected by Next.js framework (secure cookie for form submissions)
- XSS: React/JSX prevents template injection; user input (name, email) sanitized by DB constraint
- SQL Injection: Prevented by Drizzle ORM parameterized queries
- Env Validation: Zod validates DATABASE_URL format at startup (t3-oss/env-nextjs)

---

*Architecture analysis: 2026-02-13*
