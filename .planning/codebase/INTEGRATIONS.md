# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**Analytics:**
- PostHog - Product analytics and feature flags (optional, Phase 5)
  - SDK/Client: `posthog-js` (^1.347.0)
  - Environment: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
  - Implementation: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/posthog-provider.tsx`
  - Configuration: Auto-initializes on client-side if env vars present
  - Features: Person profiles (identified_only), page leave tracking, manual pageview capture
  - Graceful degradation: No error if PostHog unavailable (env vars empty)

**Web Vitals Monitoring:**
- Native Web Vitals tracking (Largest Contentful Paint, First Input Delay, etc.)
  - Implementation: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/web-vitals.tsx`
  - Uses PostHog for event capture if available

## Data Storage

**Databases:**
- **Neon Postgres** (serverless)
  - Connection: `DATABASE_URL` environment variable (server-side only)
  - Client: `@neondatabase/serverless` (latest)
  - ORM: Drizzle ORM (latest) with `drizzle-orm/neon-serverless` adapter
  - Location: `/home/hybridz/Projects/404tf/packages/database/`

**Database Schema:**
- Schema name: `"404 Tech Found"` (PostgreSQL schema)
- Tables: `intentSubmissions` (`landing_intent_submissions` in DB)
  - Columns: id (UUID), intent (enum), name (text), email (text), locale (enum), createdAt (timestamp)
  - Enums: `landing_intent` (build, collaborate, connect), `landing_locale` (es, en)
  - Location: `/home/hybridz/Projects/404tf/packages/database/src/schema.ts`

**Database Management:**
- Drizzle Kit CLI for migrations
  - Commands: `bun run db:generate`, `bun run db:push`, `bun run db:studio`
  - Config: Drizzle Kit configured in `/home/hybridz/Projects/404tf/packages/database/` workspace

**File Storage:**
- Local assets only (static public files)
  - Location: `/home/hybridz/Projects/404tf/apps/landing/public/`
  - Image optimization: Next.js Image component with AVIF and WebP formats

**Caching:**
- None detected - applications are stateless, suitable for serverless deployment

## Authentication & Identity

**Auth Provider:**
- Custom/None - No auth provider integrated
- Site is public; intent submissions are anonymous (name/email/intent captured without authentication)
- Future consideration: Add auth for management features

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar error tracking service integrated
- PostHog can track errors as events if Phase 5 analytics enabled

**Logs:**
- Next.js default logging to stdout/stderr
- Vercel captures and displays logs in deployment dashboard
- PostHog events for user behavior analysis (if enabled)

**Metrics:**
- Web Vitals (LCP, FID, CLS) tracked via PostHog (Phase 5)
- Next.js build metrics available in console output

## CI/CD & Deployment

**Hosting:**
- Vercel (Next.js-optimized platform)
  - Configuration: `vercel.json` in `/home/hybridz/Projects/404tf/apps/landing/`
  - Automatic deployments on git push (typical Vercel setup)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI service explicitly configured
- Vercel provides built-in CI/CD on push

**Pre-commit Checks:**
- Biome linting and formatting enforcement via lefthook
  - Configuration: `/home/hybridz/Projects/404tf/lefthook.yml`
  - Commit message linting: commitlint-rs
  - Prevents commits with lint errors or invalid messages

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` (critical) - Neon PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL` - Base URL for canonical links and metadata
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key (optional for Phase 5)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog API host (optional for Phase 5)

**Public env vars (prefixed NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SITE_URL` - Exposed to browser
- `NEXT_PUBLIC_PROJECT_NAME` - Exposed to browser (default: "404 Tech Found")
- `NEXT_PUBLIC_POSTHOG_KEY` - Exposed to browser (when analytics enabled)
- `NEXT_PUBLIC_POSTHOG_HOST` - Exposed to browser (when analytics enabled)

**Server-only env vars:**
- `DATABASE_URL` - PostgreSQL credentials (server-side only, not exposed)
- `NODE_ENV` - Validated internally (development, test, production)

**Secrets location:**
- `.env` file (gitignored) - Local development secrets
- `.env.example` - Template with required variables documented
- Vercel Environment Variables dashboard - Production secrets management
- Database URL validation: Implemented in `/home/hybridz/Projects/404tf/packages/database/src/env.ts`

## Webhooks & Callbacks

**Incoming:**
- None detected - No webhook endpoints configured

**Outgoing:**
- None currently - PostHog integrations would be event captures (not webhooks)
- Future: Could integrate Slack notifications, email services for form submissions

## Third-Party SDK Configuration

**t3-oss/env:**
- `@t3-oss/env-nextjs` (latest) and `@t3-oss/env-core` (latest)
- Provides `createEnv()` for type-safe environment validation
- Used in database package: `/home/hybridz/Projects/404tf/packages/database/src/env.ts`
- Zod integration for schema validation

**Internationalization:**
- next-intl (latest) - All routing, locale detection, and translations
  - Messages location: `/home/hybridz/Projects/404tf/apps/landing/messages/` (JSON translation files)
  - Routing file: `/home/hybridz/Projects/404tf/apps/landing/src/i18n/routing.ts`
  - Proxy module: `/home/hybridz/Projects/404tf/apps/landing/src/proxy.ts` (Next.js 16 convention)

## Data Flow

**Intent Submission Flow:**
1. User submits form on landing page (intent, name, email, locale)
2. Form submitted via Server Action (client → server)
3. Data validated with Zod schema
4. Submitted to `intentSubmissions` table via Drizzle ORM
5. Stored in Neon Postgres database
6. Locale-aware confirmation to user

**Analytics Flow (Phase 5, when enabled):**
1. PostHog client initializes on app load if env vars present
2. Page views captured manually (not auto)
3. Web Vitals sent to PostHog on measurement
4. User events tracked for engagement metrics
5. Graceful degradation if PostHog unavailable

---

*Integration audit: 2026-02-13*
