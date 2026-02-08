# Architecture Research

**Domain:** Next.js 16 SSR Landing Page with i18n
**Researched:** 2026-02-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Client (Browser)                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │ Static RSC │  │ Client      │  │ Interactive  │              │
│  │ (HTML/CSS) │  │ Components  │  │ Forms        │              │
│  │            │  │ (Framer)    │  │ (TanStack)   │              │
│  └──────┬─────┘  └──────┬──────┘  └──────┬───────┘              │
│         │               │                 │                      │
├─────────┴───────────────┴─────────────────┴──────────────────────┤
│                    Next.js 16 App Router                         │
│         ┌────────────────────────────────────────┐               │
│         │      Server Components (RSC)            │               │
│         │    • Pages (default Server)             │               │
│         │    • Layouts (default Server)           │               │
│         │    • Data fetching components           │               │
│         └────────┬───────────────────────────────┘               │
│                  │                                                │
│         ┌────────┴───────────────────────────────┐               │
│         │    Server Actions / API Routes          │               │
│         │    • Form submissions                   │               │
│         │    • Database mutations                 │               │
│         └────────┬───────────────────────────────┘               │
├──────────────────┴───────────────────────────────────────────────┤
│                      Data Layer                                  │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐            │
│  │ Drizzle ORM  │  │ Neon        │  │ PostHog      │            │
│  │ (Type-safe)  │  │ (Postgres)  │  │ (Analytics)  │            │
│  └──────────────┘  └─────────────┘  └──────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Server Components (RSC)** | Static content rendering, data fetching, SEO metadata | Default for all pages/layouts in app/[locale]/ |
| **Client Components** | Interactivity (animations, forms, state) | Marked with 'use client', pushed to component boundaries |
| **Server Actions** | Database mutations, form processing | Co-located with components in actions/ or inline |
| **API Routes** | External webhooks, public APIs | app/api/ (only when Server Actions insufficient) |
| **next-intl middleware** | Locale detection & routing | Proxy.ts (middleware.ts pre-Next.js 16) |
| **Drizzle ORM** | Type-safe database queries | Schema in db/schema.ts, queries via Server Actions |
| **shadcn/ui** | UI component library | components/ui/ (generated), wrapped as needed |
| **PostHog** | Analytics & feature flags | Client-side provider in app/providers.tsx |

## Recommended Project Structure

```
/home/hybridz/Projects/404tf/
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── layout.tsx            # Root layout (returns children only)
│   │   ├── [locale]/             # Locale-based routing (next-intl)
│   │   │   ├── layout.tsx        # Locale-specific layout (fonts, providers)
│   │   │   ├── page.tsx          # Landing page (Server Component)
│   │   │   ├── error.tsx         # Error boundary
│   │   │   ├── not-found.tsx     # 404 page
│   │   │   ├── opengraph-image.tsx  # Dynamic OG image
│   │   │   └── sitemap.ts        # Dynamic sitemap generation
│   │   ├── api/                  # API routes (use sparingly)
│   │   │   └── webhook/          # External webhooks only
│   │   └── proxy.ts              # next-intl locale routing (replaces middleware.ts)
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui generated components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── sections/             # Landing page sections
│   │   │   ├── hero-section.tsx       # Server Component (static)
│   │   │   ├── features-section.tsx   # Server Component (static)
│   │   │   ├── navbar.tsx             # Client Component (scroll state)
│   │   │   ├── intent-cta.tsx         # Client Component (form)
│   │   │   └── ...
│   │   └── providers/            # Context providers (all Client Components)
│   │       ├── posthog-provider.tsx
│   │       └── theme-provider.tsx
│   │
│   ├── lib/                      # Utilities and shared logic
│   │   ├── utils.ts              # General utilities (cn, etc.)
│   │   ├── actions.ts            # Shared Server Actions
│   │   └── constants.ts          # App constants
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── index.ts              # Database connection
│   │   └── migrations/           # SQL migrations
│   │
│   ├── i18n/                     # Internationalization
│   │   ├── config.ts             # i18n configuration
│   │   ├── routing.ts            # Locale routing config (defineRouting)
│   │   ├── navigation.ts         # Typed navigation helpers
│   │   └── request.ts            # Request-scoped i18n (Server Components)
│   │
│   ├── env/                      # Environment variable validation
│   │   └── index.ts              # @t3-oss/env-nextjs setup
│   │
│   └── styles/
│       └── globals.css           # Tailwind + global styles
│
├── messages/                     # i18n translation files
│   ├── en.json
│   ├── es.json
│   └── ...
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── components.json               # shadcn/ui configuration
└── drizzle.config.ts             # Drizzle ORM configuration
```

### Structure Rationale

- **app/[locale]/:** next-intl requires a top-level [locale] dynamic segment for locale-based routing. Root layout.tsx stays minimal (just returns children), while [locale]/layout.tsx handles fonts, metadata, and providers.

- **components/sections/:** Landing page sections are co-located by feature. Most are Server Components by default; only those needing interactivity (animations, forms, state) use 'use client'.

- **components/ui/:** shadcn/ui components generated here. These are Client Components by default but can be used in Server Components via composition patterns.

- **lib/actions.ts vs inline actions:** Shared Server Actions live in lib/actions.ts. Component-specific actions can be co-located in the same file as the component (after 'use server' directive).

- **db/:** Database layer is type-safe via Drizzle. Schema definitions in schema.ts, migrations auto-generated. Connection pooling handled by Neon's serverless driver.

- **i18n/:** next-intl configuration split across multiple files. request.ts provides request-scoped translations for Server Components. routing.ts defines locale configuration using defineRouting.

- **env/:** @t3-oss/env-nextjs validates environment variables at build time and runtime. Imported in next.config.ts to fail fast.

## Architectural Patterns

### Pattern 1: Server-First with Client Islands

**What:** Default to Server Components for all pages and layouts. Add 'use client' only at the boundaries where interactivity is needed (animations, forms, state).

**When to use:** Always. This is the recommended Next.js 16 App Router pattern.

**Trade-offs:**
- **Pros:** Smaller JS bundle, better SEO, faster initial load, automatic code splitting
- **Cons:** Learning curve for Server vs Client boundaries, can't use React hooks in Server Components

**Example:**
```typescript
// app/[locale]/page.tsx (Server Component - no 'use client')
import { getTranslations } from 'next-intl/server'
import HeroSection from '@/components/sections/hero-section'
import IntentCTA from '@/components/sections/intent-cta'

export default async function LandingPage() {
  const t = await getTranslations('landing')

  return (
    <>
      <HeroSection title={t('hero.title')} /> {/* Server Component */}
      <IntentCTA /> {/* Client Component - has form interactivity */}
    </>
  )
}

// components/sections/hero-section.tsx (Server Component)
export default function HeroSection({ title }: { title: string }) {
  return <section>{title}</section>
}

// components/sections/intent-cta.tsx (Client Component)
'use client'
import { useForm } from '@tanstack/react-form'

export default function IntentCTA() {
  const form = useForm({ /* ... */ })
  return <form>{/* interactive form */}</form>
}
```

### Pattern 2: Server Component Children in Client Component Slots

**What:** When a Client Component needs to wrap Server Components (e.g., Modal wrapping data), pass Server Components as `children` props rather than importing them.

**When to use:** When you need client-side interactivity (animations, modals) around server-rendered content.

**Trade-offs:**
- **Pros:** Server Components stay server-rendered, reducing client JS bundle
- **Cons:** Less intuitive than direct imports, requires understanding RSC boundaries

**Example:**
```typescript
// components/ui/animated-section.tsx (Client Component)
'use client'
import { motion } from 'framer-motion'

export default function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {children}
    </motion.div>
  )
}

// app/[locale]/page.tsx (Server Component)
import AnimatedSection from '@/components/ui/animated-section'
import FeaturesContent from '@/components/sections/features-content'

export default async function Page() {
  return (
    <AnimatedSection>
      <FeaturesContent /> {/* Server Component passed as children */}
    </AnimatedSection>
  )
}
```

### Pattern 3: Server Actions for Forms Instead of API Routes

**What:** Use Server Actions (functions marked with 'use server') for form submissions and database mutations instead of creating API routes.

**When to use:** All internal form submissions and mutations. Only use API routes for external webhooks or when you need explicit HTTP control (CORS, custom headers).

**Trade-offs:**
- **Pros:** Type-safe, simpler, automatic error handling, progressive enhancement
- **Cons:** Can't be called from external clients, less explicit than HTTP endpoints

**Example:**
```typescript
// lib/actions.ts (Server Actions)
'use server'
import { db } from '@/db'
import { leads } from '@/db/schema'
import { z } from 'zod'

const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1)
})

export async function submitLead(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    company: formData.get('company')
  }

  const validatedData = leadSchema.parse(rawData)

  await db.insert(leads).values(validatedData)

  return { success: true }
}

// components/sections/intent-cta.tsx (Client Component)
'use client'
import { useForm } from '@tanstack/react-form'
import { submitLead } from '@/lib/actions'

export default function IntentCTA() {
  const form = useForm({
    defaultValues: { email: '', company: '' },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.append('email', value.email)
      formData.append('company', value.company)
      await submitLead(formData)
    }
  })

  return <form onSubmit={/* ... */}>{/* form fields */}</form>
}
```

### Pattern 4: Locale-Based Routing with next-intl

**What:** Use next-intl's [locale] dynamic segment for locale-based routing. Middleware (proxy.ts in Next.js 16) handles locale detection and routing.

**When to use:** Any multi-language application.

**Trade-offs:**
- **Pros:** Type-safe translations, automatic locale routing, SSR-compatible
- **Cons:** Requires careful setup, different APIs for Server vs Client Components

**Example:**
```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // /about for English, /es/about for Spanish
})

// app/proxy.ts (Next.js 16 - was middleware.ts pre-v16)
import { createMiddleware } from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/', '/(en|es)/:path*']
}

// i18n/request.ts (Server Components)
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})

// app/[locale]/page.tsx (Server Component)
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('landing')
  return <h1>{t('hero.title')}</h1>
}

// components/sections/navbar.tsx (Client Component)
'use client'
import { useTranslations } from 'next-intl'

export default function Navbar() {
  const t = useTranslations('nav')
  return <nav>{t('home')}</nav>
}
```

### Pattern 5: Dynamic OpenGraph Image Generation

**What:** Use Next.js 16's built-in ImageResponse API to generate dynamic OG images at build time or request time.

**When to use:** When you need social media preview images with dynamic content (translated text, user data).

**Trade-offs:**
- **Pros:** No external image generation service, Edge Runtime compatible, Satori for JSX rendering
- **Cons:** Limited to flexbox layout, requires custom fonts to be loaded

**Example:**
```typescript
// app/[locale]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const runtime = 'edge'

export default async function Image({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' })

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {t('title')}
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}
```

### Pattern 6: Type-Safe Environment Variables

**What:** Use @t3-oss/env-nextjs to validate environment variables at build time and runtime with Zod schemas.

**When to use:** Always. Prevents runtime errors from missing/invalid environment variables.

**Trade-offs:**
- **Pros:** Type-safe access, fail-fast at build time, clear error messages
- **Cons:** Requires setup, must explicitly list client vars in runtimeEnv

**Example:**
```typescript
// env/index.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    POSTHOG_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test'])
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST
  }
})

// next.config.ts (import to validate at build time)
import './env'

export default { /* ... */ }

// Usage in code
import { env } from '@/env'

await db.connect(env.DATABASE_URL) // Type-safe
```

## Data Flow

### Request Flow (Server-Rendered Page)

```
User navigates to /es/about
    ↓
proxy.ts (next-intl middleware)
    ↓ (detects locale: 'es')
app/[locale]/page.tsx (Server Component)
    ↓ (async data fetching)
i18n/request.ts → loads messages/es.json
    ↓
Server Component renders with translations
    ↓ (RSC payload)
Client receives HTML + minimal JS
    ↓
Hydration of Client Components only (navbar, forms, animations)
```

### Form Submission Flow (Server Actions)

```
User fills form in IntentCTA (Client Component)
    ↓
TanStack Form validates client-side
    ↓ (onSubmit)
submitLead(formData) Server Action
    ↓ (runs on server)
Zod validates server-side
    ↓
Drizzle ORM inserts to Neon Postgres
    ↓
Server Action returns { success: true }
    ↓
Client Component updates UI
```

### i18n Translation Flow

```
Server Component:
  getTranslations('namespace') → i18n/request.ts → messages/[locale].json → translation

Client Component:
  useTranslations('namespace') → NextIntlClientProvider → translation
```

### Analytics Flow (PostHog)

```
app/[locale]/layout.tsx
    ↓
<PostHogProvider> (Client Component with 'use client')
    ↓
children (can be Server Components)
    ↓
posthog.capture() in Client Components
```

### Key Data Flows

1. **Static Content Rendering:** Server Components fetch translations and render HTML on the server. No client JS needed for static sections.

2. **Interactive Forms:** Client Components (TanStack Forms) handle client-side validation and state. Server Actions handle submission and database mutations.

3. **Locale Routing:** Middleware (proxy.ts) detects locale from URL or browser settings. Routes to app/[locale]/* with appropriate locale parameter.

4. **Database Mutations:** All database writes go through Server Actions. Drizzle ORM provides type-safe query building. Neon provides serverless connection pooling.

5. **Analytics Events:** PostHog client-side provider captures events. Server-side feature flags via PostHog API in Server Components.

## Scaling Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Database** | Single Neon Postgres instance (serverless) | Connection pooling via Neon (built-in) | Read replicas, consider edge caching with Upstash Redis |
| **Hosting** | Vercel Hobby tier (serverless) | Vercel Pro (edge functions, ISR) | Vercel Enterprise or self-hosted on AWS/Cloudflare |
| **Caching** | Next.js default caching (static pages) | Aggressive ISR, CDN cache headers | Edge caching with KV store, partial prerendering |
| **Forms/Analytics** | Client-side only | Server-side validation critical | Rate limiting, queue form processing with Inngest |
| **i18n** | Static translations (build-time) | Static translations sufficient | Consider edge translations with KV store |
| **Images** | Next.js Image Optimization (Vercel) | Vercel Image Optimization included | Self-host with Cloudflare Images or Imgix |

### Scaling Priorities

1. **First bottleneck: Database connections** - Neon's serverless driver handles pooling automatically. If you exceed connection limits, add read replicas or introduce Redis caching for frequently accessed data (e.g., translation strings).

2. **Second bottleneck: Form spam/abuse** - Implement rate limiting via Upstash Redis or Vercel KV. Add Cloudflare Turnstile or hCaptcha to forms. Queue form processing with Inngest to prevent DB overload.

## Anti-Patterns

### Anti-Pattern 1: Using Context in Server Components

**What people do:** Try to use React Context (createContext, useContext) in Server Components.

**Why it's wrong:** Context is a client-side React feature. Server Components don't support hooks or context.

**Do this instead:** Use React.cache() for Server Components or pass data as props. For client-side shared state, create a Client Component provider and pass Server Components as children.

```typescript
// ❌ BAD: Context in Server Component
import { createContext } from 'react'
export const AppContext = createContext() // Won't work in Server Components

// ✅ GOOD: Client Component provider with Server children
// providers/theme-provider.tsx
'use client'
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

// app/[locale]/layout.tsx (Server Component)
import { ThemeProvider } from '@/components/providers/theme-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children} {/* Server Components can be children */}
    </ThemeProvider>
  )
}
```

### Anti-Pattern 2: Importing Server Components into Client Components

**What people do:** Try to import and render Server Components directly inside Client Components.

**Why it's wrong:** Once you mark a component with 'use client', all its imports become Client Components. This defeats the purpose of Server Components and increases bundle size.

**Do this instead:** Pass Server Components as props (children, or named slots) to Client Components.

```typescript
// ❌ BAD: Importing Server Component into Client Component
'use client'
import ServerDataComponent from './server-data-component' // This becomes a Client Component!

export function Modal() {
  return <div><ServerDataComponent /></div>
}

// ✅ GOOD: Pass Server Component as children
'use client'
export function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// In parent Server Component
import Modal from './modal'
import ServerDataComponent from './server-data-component'

export default function Page() {
  return (
    <Modal>
      <ServerDataComponent /> {/* Stays a Server Component */}
    </Modal>
  )
}
```

### Anti-Pattern 3: Using useSearchParams in Server Components

**What people do:** Try to use useSearchParams or other client hooks to access the incoming request in Server Components.

**Why it's wrong:** Hooks are client-only. Server Components receive request data differently.

**Do this instead:** Use searchParams prop automatically passed to page.tsx Server Components.

```typescript
// ❌ BAD: Hook in Server Component
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams() // Error: can't use hooks in Server Components
  return <div>{searchParams.get('query')}</div>
}

// ✅ GOOD: Use searchParams prop
export default function Page({
  searchParams
}: {
  searchParams: { query?: string }
}) {
  return <div>{searchParams.query}</div>
}
```

### Anti-Pattern 4: Over-Using API Routes Instead of Server Actions

**What people do:** Create API routes for every form submission and mutation (legacy Pages Router habit).

**Why it's wrong:** API routes require more boilerplate (parsing FormData, manual error handling, no type safety). Server Actions are simpler and type-safe.

**Do this instead:** Use Server Actions for all internal mutations. Reserve API routes for external webhooks or when you need explicit HTTP control.

```typescript
// ❌ BAD: API route for form submission
// app/api/submit-lead/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // Manual parsing, no type safety
  await db.insert(leads).values(body)
  return Response.json({ success: true })
}

// ✅ GOOD: Server Action
// lib/actions.ts
'use server'
import { z } from 'zod'

const leadSchema = z.object({ email: z.string().email() })

export async function submitLead(formData: FormData) {
  const data = leadSchema.parse(Object.fromEntries(formData))
  await db.insert(leads).values(data)
  return { success: true }
}
```

### Anti-Pattern 5: Not Using localePrefix Strategically

**What people do:** Always show locale prefix in URL (/en/about even for default locale).

**Why it's wrong:** Longer URLs for primary audience, worse SEO (duplicate content concerns).

**Do this instead:** Use localePrefix: 'as-needed' to hide prefix for default locale.

```typescript
// ❌ BAD: Always show prefix
export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en'
  // localePrefix defaults to 'always': /en/about, /es/about
})

// ✅ GOOD: Hide prefix for default locale
export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // /about for English, /es/about for Spanish
})
```

### Anti-Pattern 6: Putting All Code in app/ Directory

**What people do:** Place all components, utilities, and logic inside the app/ directory.

**Why it's wrong:** Cluttered structure, harder to navigate, no clear separation between routing and business logic.

**Do this instead:** Use app/ only for routing (pages, layouts, metadata). Put components in components/, utilities in lib/, database in db/.

```typescript
// ❌ BAD: Everything in app/
app/
├── [locale]/
│   ├── page.tsx
│   ├── hero-section.tsx     // Component in routing directory
│   ├── utils.ts             // Utility in routing directory
│   └── actions.ts           // Actions in routing directory

// ✅ GOOD: Clear separation
src/
├── app/                      # Routing only
│   └── [locale]/
│       └── page.tsx
├── components/               # UI components
│   └── sections/
│       └── hero-section.tsx
├── lib/                      # Utilities and actions
│   ├── utils.ts
│   └── actions.ts
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Neon (Postgres)** | Drizzle ORM serverless driver | Connection pooling automatic. Use `@neondatabase/serverless` driver. |
| **PostHog** | Client-side provider + Server-side API | Provider in layout with 'use client'. Feature flags via API in Server Components. Set `external_scripts_inject_target: 'head'` to avoid hydration errors. |
| **Framer Motion** | Wrap motion components as Client Components | Create wrapper components with 'use client'. Pass Server Components as children. |
| **shadcn/ui** | CLI-generated components in components/ui/ | All shadcn components are Client Components by default. Can be used in Server Components via composition. |
| **TanStack Forms** | Client Component form handlers | Use with Server Actions via onSubmit. Some rough edges with useActionState integration as of 2026. |
| **next-intl** | Middleware (proxy.ts) + Server/Client APIs | Different APIs for Server (getTranslations) vs Client (useTranslations) components. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Server Component ↔ Client Component** | Props (serializable data only) | Can't pass functions. Use Server Actions for callbacks. |
| **Server Component → Server Component** | Direct import and props | No restrictions. Use React.cache() for shared data fetching. |
| **Client Component → Server Action** | Direct import and invocation | Type-safe. Server Action can be imported and called like a normal function. |
| **Client Component ↔ Client Component** | Context, props, or state management | Standard React patterns. |
| **Server Action → Database** | Drizzle ORM | Type-safe queries. Use transactions for multiple operations. |

## Build Order & Dependencies

For a Next.js 16 landing page with the specified features, build order matters due to dependencies between systems.

### Dependency Chain

```
1. Environment Setup (@t3-oss/env-nextjs)
   ├─ Required by: Everything
   └─ Dependencies: None

2. Database Setup (Drizzle + Neon)
   ├─ Required by: Server Actions, forms
   └─ Dependencies: Environment variables

3. i18n Setup (next-intl)
   ├─ Required by: All pages, components
   └─ Dependencies: None

4. Base Layout (app/layout.tsx, app/[locale]/layout.tsx)
   ├─ Required by: All pages
   └─ Dependencies: i18n, environment

5. UI Components (shadcn/ui)
   ├─ Required by: Sections, forms
   └─ Dependencies: None

6. Providers (PostHog, Theme)
   ├─ Required by: Analytics, theming
   └─ Dependencies: Environment, layout

7. Server Components (static sections)
   ├─ Required by: Pages
   └─ Dependencies: i18n, UI components

8. Client Components (interactive sections)
   ├─ Required by: Pages
   └─ Dependencies: i18n, UI components, Framer Motion

9. Server Actions (forms)
   ├─ Required by: Client Components (forms)
   └─ Dependencies: Database, environment

10. Metadata (OG images, sitemap, robots)
    ├─ Required by: SEO
    └─ Dependencies: i18n
```

### Suggested Build Order for Migration from Vite SPA

Based on the dependency chain, here's the recommended order for migrating the 11 landing sections from Vite/React SPA to Next.js 16:

**Phase 1: Foundation (Build First)**
1. Environment setup (env/index.ts)
2. Database schema (db/schema.ts, db/index.ts)
3. i18n configuration (i18n/routing.ts, i18n/request.ts, app/proxy.ts)
4. Root layouts (app/layout.tsx, app/[locale]/layout.tsx)
5. shadcn/ui initialization (components/ui/)

**Phase 2: Static Content (Server Components)**
6. Sections with no interactivity → Server Components
   - HeroSection
   - FeaturesSection
   - TestimonialsSection
   - FooterSection
   - etc.

**Phase 3: Interactive Components (Client Components)**
7. Sections needing 'use client'
   - Navbar (scroll state)
   - IntentCTA (form)
   - TractionBar (count-up animation)
   - AnnouncementBanner (dismiss state)
   - Any sections with Framer Motion animations

**Phase 4: Data Layer**
8. Server Actions for form submissions (lib/actions.ts)
9. Database integration with Drizzle
10. TanStack Forms setup in Client Components

**Phase 5: Analytics & Metadata**
11. PostHog provider and events
12. Dynamic OG images (app/[locale]/opengraph-image.tsx)
13. Sitemap and robots.txt generation

### Critical Path Items

- **Blocking:** i18n setup must be complete before any pages can render (proxy.ts, routing.ts, request.ts, message files)
- **Blocking:** Environment validation must be complete before database connection or external service initialization
- **Not blocking:** Animations (Framer Motion) can be added incrementally to existing sections
- **Not blocking:** Analytics (PostHog) can be added last without affecting functionality

## Sources

- [Next.js Architecture in 2026 — Server-First, Client-Islands, and Scalable App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js Docs: Getting Started - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Docs: Getting Started - Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [next-intl Docs: Getting Started - App Router](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl Docs: Routing Setup](https://next-intl.dev/docs/routing/setup)
- [Server Actions vs Route Handlers in Next.js | MakerKit](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers)
- [How to Use Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [Solving Framer Motion Page Transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router)
- [How to Architect a Scalable SaaS with Next.js 15, Shadcn, Drizzle](https://shashankbiplav.hashnode.dev/how-to-architect-a-scalable-saas-with-nextjs-15-shadcn-drizzle-and-stripe-2026-guide)
- [Next.js 15 + Drizzle ORM: A Beginner's Guide to CRUD Operations | Medium](https://medium.com/@aslandjc7/next-js-15-drizzle-orm-a-beginners-guide-to-crud-operations-ae7f2701a8c3)
- [TanStack Form: Next Server Actions Example](https://tanstack.com/form/v1/docs/framework/react/examples/next-server-actions)
- [Next.js Docs: Metadata Files - OpenGraph Image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Generate Dynamic OG Images with Next.js 16 | MakerKit](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [shadcn/ui Docs: Installation - Next.js](https://ui.shadcn.com/docs/installation/next)
- [PostHog Docs: Next.js Integration](https://posthog.com/docs/libraries/next-js)
- [PostHog Tutorial: Next.js App Router Analytics](https://posthog.com/tutorials/nextjs-app-directory-analytics)
- [T3 Env: Next.js Documentation](https://env.t3.gg/docs/nextjs)
- [Vercel Blog: Common Mistakes with the Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js Docs: App Router - Composition Patterns](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)

---
*Architecture research for: Next.js 16 SSR Landing Page with i18n*
*Researched: 2026-02-08*
