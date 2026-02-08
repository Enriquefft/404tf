# Phase 1: Foundation - Research

**Researched:** 2026-02-08
**Domain:** Next.js 16 App Router, Tailwind v4, next-intl, Drizzle ORM, Developer Tooling
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for the 404 Tech Found landing page: Next.js 16 with App Router and Turbopack, Tailwind v4 styling system with cyberpunk purple theme, next-intl bilingual routing (ES/EN), Drizzle ORM with Neon serverless Postgres, type-safe environment variables via @t3-oss/env-nextjs, and complete developer tooling (Biome, Lefthook, commitlint, Knip).

This research synthesizes findings from existing domain research (.planning/research/), analysis of the reference Next.js 16 template (/home/hybridz/Projects/next-fullstack-template), and the existing Vite/React SPA content source (/home/hybridz/Projects/deep-tech-nexus). All implementation specifics are verified against Next.js 16 documentation, package versions confirmed via npm registry, and architectural patterns validated against official Next.js App Router best practices.

**Primary recommendation:** Follow the 3-plan structure (init, styling+i18n, data layer) to isolate risk domains. Build system first (Plan 01-01), then styling and routing (Plan 01-02), finally database layer (Plan 01-03). This allows early validation of the highest-risk components (Tailwind v4 + Turbopack compatibility, next-intl proxy.ts setup) before adding database complexity.

## Standard Stack

### Core Framework
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `next` | 16.1.6+ | React framework with App Router, SSR, Turbopack | `bun add next@latest` |
| `react` | 19.2+ | UI library (required by Next.js 16) | `bun add react@latest react-dom@latest` |
| `typescript` | 5.1.0+ | Type safety (minimum required by Next.js 16) | `bun add -D typescript @types/node @types/react @types/react-dom` |
| `bun` | 1.3.8+ | JavaScript runtime & package manager | System-level installation |

### Styling & UI
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `tailwindcss` | 4.0.7+ | Utility-first CSS (v4 stable, avoid 4.1.18 with Turbopack) | `bun add -D tailwindcss@~4.0.0 @tailwindcss/postcss postcss` |
| `shadcn/ui` | latest | Component library (CLI-generated, RSC-compatible) | `bunx shadcn@latest init` |

**Tailwind v4 Version Note:** Avoid v4.1.18 which has known Turbopack build failures. Use v4.0.7 or latest v4.0.x patch. The `~4.0.0` semver range ensures compatibility.

### Internationalization
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `next-intl` | 4.8.2+ | i18n with locale routing | `bun add next-intl@latest` |

### Database & ORM
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `drizzle-orm` | latest | TypeScript ORM (serverless-native) | `bun add drizzle-orm @neondatabase/serverless` |
| `@neondatabase/serverless` | latest | Neon HTTP driver for serverless | Installed with drizzle-orm |
| `drizzle-kit` | latest | Schema migrations CLI | `bun add -D drizzle-kit` |

### Environment Validation
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `@t3-oss/env-nextjs` | 0.13.10+ | Type-safe env vars with Zod | `bun add @t3-oss/env-nextjs zod` |
| `zod` | latest | Schema validation (required by @t3-oss/env-nextjs) | Installed with @t3-oss/env-nextjs |

### Developer Tooling
| Package | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `@biomejs/biome` | 2.3+ | Linter & formatter (replaces ESLint + Prettier) | `bun add -D @biomejs/biome` |
| `lefthook` | 2.1.0+ | Git hooks manager (replaces Husky) | `bun add -D lefthook` |
| `@commitlint/cli` | latest | Commit message linting | `bun add -D @commitlint/cli @commitlint/config-conventional` |
| `knip` | latest | Dead code detection | `bun add -D knip` |

### Complete Installation Command

```bash
# Core framework
bun add next@latest react@latest react-dom@latest

# TypeScript
bun add -D typescript @types/node @types/react @types/react-dom

# Styling (Tailwind v4 - avoid v4.1.18)
bun add -D tailwindcss@~4.0.0 @tailwindcss/postcss postcss

# i18n
bun add next-intl@latest

# Database
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit

# Environment validation
bun add @t3-oss/env-nextjs zod

# Developer tooling
bun add -D @biomejs/biome lefthook @commitlint/cli @commitlint/config-conventional knip

# shadcn/ui (CLI - run after initial setup)
bunx shadcn@latest init
```

## Architecture Patterns

### Pattern 1: App Router File Structure with i18n

**What:** Next.js 16 App Router with next-intl requires a specific two-layout structure: minimal root layout + locale-specific layout.

**File Structure:**
```
src/
├── app/
│   ├── layout.tsx                    # Root layout (returns children only)
│   ├── [locale]/                     # Locale dynamic segment
│   │   ├── layout.tsx                # Locale layout (fonts, providers, metadata)
│   │   ├── page.tsx                  # Landing page
│   │   ├── error.tsx                 # Error boundary
│   │   └── not-found.tsx             # 404 page
│   └── proxy.ts                      # next-intl middleware (was middleware.ts pre-v16)
│
├── i18n/
│   ├── routing.ts                    # defineRouting config
│   ├── request.ts                    # Server Component i18n setup
│   └── navigation.ts                 # Typed navigation helpers
│
├── messages/                         # Translation files (outside src/)
│   ├── en.json
│   └── es.json
```

**Why this structure:**
- Root layout must NOT render `<html>` or `<body>` directly (conflicts with locale layout)
- Locale layout handles HTML attributes (`lang`, `suppressHydrationWarning`), fonts, providers
- `proxy.ts` in Next.js 16 replaces `middleware.ts` (breaking change from v15)
- `messages/` outside `src/` prevents import path issues with next-intl

**Example Implementation:**

```typescript
// app/layout.tsx (Root Layout - Minimal)
type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children; // No <html> or <body> here
}
```

```typescript
// app/[locale]/layout.tsx (Locale Layout - Full)
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: next-intl Configuration (4 Files)

**What:** next-intl requires 4 configuration files for complete setup.

**1. i18n/routing.ts** - Locale configuration
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'es', // 404 Tech Found is Spanish-first
  localePrefix: 'as-needed' // /about for ES, /en/about for EN
});
```

**2. i18n/request.ts** - Server Component setup
```typescript
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**3. app/proxy.ts** - Middleware (Next.js 16 naming)
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)", // Exclude static files
};
```

**4. i18n/navigation.ts** - Typed navigation helpers
```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

**Critical Setup Steps:**
1. Wire `i18n/request.ts` into Next.js via `next.config.ts`:
   ```typescript
   import createNextIntlPlugin from 'next-intl/plugin';

   const withNextIntl = createNextIntlPlugin();

   export default withNextIntl({ /* next config */ });
   ```
2. Create `messages/en.json` and `messages/es.json` (outside `src/`)
3. Use `localePrefix: 'as-needed'` to hide default locale prefix (SEO best practice)

### Pattern 3: Tailwind v4 Setup (Breaking Changes from v3)

**What:** Tailwind v4 uses CSS-first configuration with `@import` instead of `@tailwind` directives.

**File: src/styles/globals.css**
```css
@import "tailwindcss";

/* Cyberpunk purple theme adapted from deep-tech-nexus */
:root {
  --radius: 0.75rem;

  /* Base colors - dark theme */
  --background: 0 0% 7%;
  --foreground: 0 0% 98%;

  /* Brand colors - purple primary */
  --primary: 262 85% 50%;
  --primary-foreground: 0 0% 98%;

  /* House colors */
  --house-ai: 330 100% 70%;        /* Pink for AI House */
  --house-biotech: 153 100% 37%;   /* Green for Biotech House */
  --house-hardware: 42 100% 50%;   /* Orange for Hardware House */

  /* shadcn/ui variables (neutral base) */
  --card: 0 0% 10%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 10%;
  --popover-foreground: 0 0% 98%;
  --secondary: 262 100% 66%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 64%;
  --accent: 262 100% 66%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 18%;
  --input: 0 0% 18%;
  --ring: 262 85% 50%;
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Orbitron', sans-serif;
  }
}

@layer utilities {
  .font-orbitron {
    font-family: 'Orbitron', sans-serif;
  }

  .text-glow-purple {
    text-shadow: 0 0 20px hsl(262 85% 50% / 0.5), 0 0 40px hsl(262 85% 50% / 0.3);
  }

  .gradient-purple {
    background: linear-gradient(135deg, hsl(262 85% 50%), hsl(262 100% 66%));
  }

  .glow-border-ai {
    box-shadow: 0 0 15px hsl(330 100% 70% / 0.3), inset 0 0 15px hsl(330 100% 70% / 0.05);
  }

  .glow-border-biotech {
    box-shadow: 0 0 15px hsl(153 100% 37% / 0.3), inset 0 0 15px hsl(153 100% 37% / 0.05);
  }

  .glow-border-hardware {
    box-shadow: 0 0 15px hsl(42 100% 50% / 0.3), inset 0 0 15px hsl(42 100% 50% / 0.05);
  }
}
```

**File: postcss.config.cjs**
```javascript
"use strict";
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Tailwind v4 Breaking Changes:**
1. **Syntax:** `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
2. **Borders:** Explicit colors required (`border border-gray-200` not just `border`)
3. **Shadow sizes:** `shadow-xs` replaces `shadow-sm`
4. **Border radius:** `rounded-xs` replaces `rounded-sm`
5. **Important modifier:** `flex!` replaces `!flex` (moved to end)
6. **File naming:** Use `globals.css` (singular) not `global.css` for App Router

**Font Loading (Orbitron):**
```typescript
// src/styles/fonts.ts
import { Inter, Orbitron } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});
```

Then in locale layout:
```typescript
import { inter, orbitron } from '@/styles/fonts';

<body className={cn(inter.variable, orbitron.variable, "font-sans")}>
```

### Pattern 4: shadcn/ui Initialization for RSC Mode

**What:** shadcn/ui v4 requires explicit RSC mode configuration.

**Command:**
```bash
bunx shadcn@latest init
```

**Interactive Prompts:**
- Style: `default`
- Base color: `neutral` (matches existing deep-tech-nexus dark theme)
- CSS variables: `yes`
- React Server Components: `yes` ✓ CRITICAL
- Path alias: `@/*` → `./src/*`
- CSS file: `src/styles/globals.css`

**Generated: components.json**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Why RSC mode matters:**
- Components generated with `'use client'` only when necessary
- Server Component optimizations by default
- Prevents unnecessary client bundle bloat

### Pattern 5: Drizzle ORM with Neon Serverless

**What:** Module-level singleton pattern for serverless Postgres connection.

**File: src/db/index.ts**
```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { databaseUrl } from '@/env/db';
import * as schema from './schema';

// Module-level singleton - connection reused across serverless invocations
export const db = drizzle(databaseUrl, { schema });
```

**File: src/db/schema.ts** (intent_submissions table)
```typescript
import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const intentEnum = pgEnum('intent', ['build', 'collaborate', 'connect']);
export const localeEnum = pgEnum('locale', ['es', 'en']);

export const intentSubmissions = pgTable('intent_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  intent: intentEnum('intent').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  locale: localeEnum('locale').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**File: drizzle.config.ts**
```typescript
import { defineConfig } from 'drizzle-kit';
import { databaseUrl } from './src/env/db';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
```

**Why this pattern:**
- HTTP driver (`neon-serverless`) works in Edge Runtime and serverless functions
- Module-level export reuses connection across invocations (no pooling needed)
- Enum types enforce data integrity at database level
- Timestamps with timezone for correct multi-region handling

**Migration Commands:**
```bash
# Generate migration from schema
bun run db:generate

# Apply migration to database
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Pattern 6: @t3-oss/env-nextjs Type-Safe Environment Variables

**What:** Split client and server env validation with Zod schemas.

**File: src/env/client.ts**
```typescript
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  server: {},
  emptyStringAsUndefined: true,
});
```

**File: src/env/db.ts** (Database-specific)
```typescript
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const neonUrlSchema = z
  .url()
  .startsWith('postgresql://', 'Database URL must be a PostgreSQL connection string')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.username && parsed.password && parsed.hostname;
      } catch {
        return false;
      }
    },
    { message: 'Invalid database URL: missing credentials or hostname' }
  );

export const dbEnv = createEnv({
  server: {
    DATABASE_URL: neonUrlSchema.optional(),
    DATABASE_URL_DEV: neonUrlSchema.optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: process.env,
  isServer: true,
  emptyStringAsUndefined: true,
  client: {},
});

export const databaseUrl = dbEnv.DATABASE_URL || dbEnv.DATABASE_URL_DEV;
if (!databaseUrl) {
  throw new Error('DATABASE_URL or DATABASE_URL_DEV must be set');
}
```

**Import in next.config.ts (validates at build time):**
```typescript
import './src/env/client';

export default { /* config */ };
```

**Why this pattern:**
- Build-time validation prevents deployment with missing env vars
- `isServer: true` prevents client detection errors in test environments
- Split files allow server-only secrets vs public env vars
- Custom Zod validators catch malformed database URLs early

### Pattern 7: Biome Configuration for Next.js

**File: biome.jsonc**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.10/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "linter": {
    "enabled": true,
    "domains": {
      "next": "all",
      "react": "all"
    },
    "rules": {
      "recommended": true,
      "complexity": {
        "useLiteralKeys": "off"
      }
    },
    "includes": ["**"],
    "excludes": [
      "**/node_modules",
      "**/.next",
      "**/src/components/ui/*"
    ]
  },
  "overrides": [
    {
      "includes": [
        "**/src/app/**/page.tsx",
        "**/src/app/**/layout.tsx",
        "**/src/app/**/error.tsx"
      ],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off",
            "useComponentExportOnlyModules": {
              "level": "error",
              "options": {
                "allowExportNames": [
                  "metadata",
                  "generateMetadata",
                  "generateStaticParams"
                ]
              }
            }
          }
        }
      }
    }
  ],
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    },
    "formatter": {
      "enabled": true
    }
  }
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "lint": "biome check --fix .",
    "check": "biome check ."
  }
}
```

**Why this config:**
- `domains: { next: "all" }` enables Next.js-specific rules
- Excludes `src/components/ui/*` (shadcn/ui generated code)
- Allows default exports in App Router files (page.tsx, layout.tsx)
- `cssModules: true` and `tailwindDirectives: true` for CSS linting

### Pattern 8: Lefthook + commitlint Setup

**File: lefthook.yml**
```yaml
commit-msg:
  scripts:
    "commitlint.sh":
      runner: bash

pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,jsx,tsx,json,jsonc}"
      run: bun lint --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
    types:
      glob: "*.{js,ts,jsx,tsx}"
      run: bunx tsc --noEmit
```

**File: .lefthook/commit-msg/commitlint.sh**
```bash
#!/bin/bash
COMMITLINT_CONFIG_PATH="$(dirname "${BASH_SOURCE[0]}")/.commitlintrc.yaml"
commitlint --config "${COMMITLINT_CONFIG_PATH}" < "$1"
```

**File: .lefthook/commit-msg/.commitlintrc.yaml**
```yaml
rules:
  type-empty:
    level: error
  subject-empty:
    level: error
  type:
    level: error
    options:
      - build
      - chore
      - ci
      - docs
      - feat
      - fix
      - perf
      - refactor
      - revert
      - style
      - test
```

**Installation:**
```bash
# Install Lefthook hooks
bunx lefthook install
```

**Why this pattern:**
- Lefthook runs in parallel (faster than Husky sequential execution)
- `commitlint.sh` script isolates config path logic
- Type checking runs only on TypeScript files (glob filter)
- Conventional commits enforced (feat:, fix:, docs:, etc.)

### Pattern 9: Knip Configuration for Next.js

**File: knip.config.ts**
```typescript
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/app/**/*',
    'src/env/**/*',
    'src/i18n/request.ts',
  ],
  ignore: [
    'src/components/ui/**/*', // shadcn/ui generated
  ],
  ignoreDependencies: [],
  paths: {
    '@/*': ['./src/*'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};

export default config;
```

**package.json script:**
```json
{
  "scripts": {
    "check:deps": "knip"
  }
}
```

**Why this config:**
- `entry` includes Next.js special files (app/*, env/*, i18n/request.ts)
- Ignores shadcn/ui components (may not be used in Phase 1)
- CSS compiler handles Tailwind `@import` directives
- Path alias matches tsconfig.json

### Pattern 10: bunfig.toml Test Configuration

**File: bunfig.toml**
```toml
[test]
preload = []
timeout = 30000
```

**Why this config:**
- Sets 30s timeout for async operations (database connections, etc.)
- No preload needed for Phase 1 (add testing-library setup in later phases)
- Bun's built-in test runner (no Jest/Vitest needed for simple tests)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Environment validation** | Custom env parsing with manual checks | `@t3-oss/env-nextjs` + Zod | Build-time validation, type-safe access, clear error messages, handles client/server split |
| **Locale routing** | Custom middleware with URL parsing | `next-intl` with `proxy.ts` | Handles browser detection, cookie persistence, typed navigation helpers, SEO-optimized URLs |
| **Database connection pooling** | Custom Pool wrapper with singleton logic | Neon serverless HTTP driver (`@neondatabase/serverless`) | Zero-config connection pooling, works in Edge Runtime, no TCP connection limits |
| **Linting + formatting** | Separate ESLint + Prettier configs | `@biomejs/biome` | 56x faster, single config, Next.js domain rules, no plugin hell |
| **Git hooks** | Custom shell scripts in `.git/hooks` | `lefthook` | Parallel execution, language-agnostic, conventional commits integration, cross-platform |
| **Form validation** | Manual input validation with useState | Zod schemas + @t3-oss/env-nextjs pattern | Type-safe, reusable schemas, server-side validation, clear error messages |
| **TypeScript path aliases** | Relative imports (`../../../lib/utils`) | `@/*` alias via tsconfig.json | Refactoring-safe, cleaner imports, standardized across team |
| **CSS configuration** | Manual PostCSS setup with plugins | `@tailwindcss/postcss` (Tailwind v4) | Zero-config, handles imports, works with Turbopack |

**Key Insight:** Phase 1 is about assembling proven tools correctly, not building infrastructure. Every "don't hand-roll" item has edge cases that waste days (locale cookie persistence, serverless connection pooling, Next.js module resolution). Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Migration Errors

**What goes wrong:**
- Using old `@tailwind base/components/utilities` directives causes build failure
- Missing explicit border colors (v4 default changed from gray-200 to currentColor)
- Installing v4.1.18 causes Turbopack build crashes
- Mixing v3 and v4 syntax (upgraded dependencies using v3 conventions)

**How to avoid:**
1. **Install stable v4.0.x:** Use `tailwindcss@~4.0.0` to avoid v4.1.18 Turbopack issue
2. **Use @import syntax:**
   ```css
   /* ✓ Correct (v4) */
   @import "tailwindcss";

   /* ✗ Wrong (v3) */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. **Explicit border colors:**
   ```html
   <!-- ✓ Correct (v4) -->
   <div class="border border-gray-200">

   <!-- ✗ Wrong (v4 shows currentColor) -->
   <div class="border">
   ```
4. **Update shadow/border-radius utilities:**
   - `shadow-sm` → `shadow-xs`
   - `rounded-sm` → `rounded-xs`
5. **PostCSS config:** Use `@tailwindcss/postcss` plugin:
   ```javascript
   module.exports = {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   ```

**Warning signs:**
- Build error: "Unknown at rule @tailwind"
- Borders appearing black instead of gray
- Turbopack crashes on CSS processing
- Shadow sizes looking different than v3

**Reference:** [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### Pitfall 2: next-intl Middleware Naming (Next.js 16)

**What goes wrong:**
- Creating `src/middleware.ts` (old Next.js convention) instead of `src/proxy.ts` (Next.js 16)
- Middleware matcher excluding locale routes
- Missing `next-intl/plugin` in next.config.ts
- Not calling `setRequestLocale()` in locale layout

**How to avoid:**
1. **Use proxy.ts naming:**
   ```typescript
   // ✓ Correct (Next.js 16)
   // src/app/proxy.ts
   import createMiddleware from 'next-intl/middleware';
   import { routing } from '@/i18n/routing';

   export default createMiddleware(routing);

   // ✗ Wrong (Next.js 15)
   // src/middleware.ts
   ```
2. **Correct matcher pattern:**
   ```typescript
   export const config = {
     // Exclude static files, API routes, internal Next.js paths
     matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
   };
   ```
3. **Wire plugin in next.config.ts:**
   ```typescript
   import createNextIntlPlugin from 'next-intl/plugin';

   const withNextIntl = createNextIntlPlugin();

   export default withNextIntl({ /* config */ });
   ```
4. **Call setRequestLocale in layout:**
   ```typescript
   // app/[locale]/layout.tsx
   import { setRequestLocale } from 'next-intl/server';

   export default async function LocaleLayout({ params }) {
     const { locale } = await params;
     setRequestLocale(locale); // Required for static rendering
     // ...
   }
   ```

**Warning signs:**
- Locale not detected from URL or browser headers
- 404 errors on `/es` and `/en` routes
- Translations not loading
- "locale is not defined" errors in Server Components

**Reference:** [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router)

### Pitfall 3: Drizzle Connection Pooling in Serverless

**What goes wrong:**
- Creating new database connection on every request (exhausts Neon connection limit)
- Using TCP driver (`pg`) instead of HTTP driver in Edge Runtime
- Forgetting to export schema from `db/schema.ts`
- Missing `dbCredentials.url` in drizzle.config.ts

**How to avoid:**
1. **Use module-level singleton:**
   ```typescript
   // ✓ Correct (singleton)
   // src/db/index.ts
   import { drizzle } from 'drizzle-orm/neon-serverless';
   import { databaseUrl } from '@/env/db';
   import * as schema from './schema';

   export const db = drizzle(databaseUrl, { schema });

   // ✗ Wrong (new connection per call)
   export function getDb() {
     return drizzle(databaseUrl, { schema });
   }
   ```
2. **Use HTTP driver for serverless:**
   ```typescript
   // ✓ Correct
   import { drizzle } from 'drizzle-orm/neon-serverless';
   import '@neondatabase/serverless';

   // ✗ Wrong (TCP not supported in Edge)
   import { drizzle } from 'drizzle-orm/node-postgres';
   ```
3. **Export schema:**
   ```typescript
   // src/db/schema.ts
   export const intentSubmissions = pgTable(/* ... */);

   // src/db/index.ts
   import * as schema from './schema'; // Must export for Drizzle to track
   export const db = drizzle(url, { schema });
   ```

**Warning signs:**
- "Too many connections" errors in Neon dashboard
- Database queries failing intermittently
- Cold start timeouts in production
- Drizzle Studio not showing tables

**Reference:** [Drizzle Neon Quickstart](https://orm.drizzle.team/docs/get-started/neon-new)

### Pitfall 4: @t3-oss/env-nextjs Build-Time Validation

**What goes wrong:**
- Not importing env config in next.config.ts (validation skipped at build time)
- Missing `runtimeEnv` mappings (env vars not accessible at runtime)
- Using `NEXT_PUBLIC_` prefix for server-only secrets (exposed to client)
- Not setting `isServer: true` in test environments

**How to avoid:**
1. **Import in next.config.ts:**
   ```typescript
   // next.config.ts
   import './src/env/client'; // Validates at build time

   export default { /* config */ };
   ```
2. **Complete runtimeEnv mapping:**
   ```typescript
   export const env = createEnv({
     server: {
       DATABASE_URL: z.string().url(),
     },
     client: {
       NEXT_PUBLIC_POSTHOG_KEY: z.string(),
     },
     runtimeEnv: {
       // ✓ Must map both server and client vars
       DATABASE_URL: process.env.DATABASE_URL,
       NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
     },
   });
   ```
3. **Server vs client vars:**
   ```typescript
   // ✓ Server-only (no NEXT_PUBLIC_)
   server: {
     DATABASE_URL: z.string().url(),
   }

   // ✗ Wrong (secret exposed to client)
   client: {
     NEXT_PUBLIC_DATABASE_URL: z.string().url(),
   }
   ```
4. **Set isServer in test env:**
   ```typescript
   export const env = createEnv({
     isServer: true, // Prevents detection errors in Happy DOM
     // ...
   });
   ```

**Warning signs:**
- Build succeeds with missing env vars (crashes at runtime)
- Secrets visible in browser Network tab
- Type errors accessing `env.VARIABLE_NAME`
- "window is not defined" in server-only env file

**Reference:** [T3 Env Next.js Docs](https://env.t3.gg/docs/nextjs)

### Pitfall 5: shadcn/ui RSC Mode Not Enabled

**What goes wrong:**
- Initializing shadcn/ui without `rsc: true` (components marked 'use client' unnecessarily)
- Wrong path alias in components.json (imports fail)
- Installing components before running `shadcn init` (missing dependencies)
- Wrong CSS file path

**How to avoid:**
1. **Run init first:**
   ```bash
   bunx shadcn@latest init
   # Select: React Server Components? Yes
   ```
2. **Verify components.json:**
   ```json
   {
     "rsc": true, // ✓ Must be true
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils"
     },
     "tailwind": {
       "css": "src/styles/globals.css" // ✓ Correct path
     }
   }
   ```
3. **Install components after init:**
   ```bash
   # ✓ Correct order
   bunx shadcn@latest init
   bunx shadcn@latest add button card

   # ✗ Wrong (missing dependencies)
   bunx shadcn@latest add button
   bunx shadcn@latest init
   ```

**Warning signs:**
- All shadcn components have `'use client'` directive
- Import errors: "Cannot find module '@/components/ui/button'"
- Tailwind classes not applied to shadcn components
- Missing `cn` utility function

**Reference:** [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)

### Pitfall 6: Biome + Next.js App Router Rule Conflicts

**What goes wrong:**
- `noDefaultExport` rule fails on page.tsx/layout.tsx (Next.js requires default exports)
- Linting shadcn/ui generated components (unnecessary churn)
- Missing Next.js domain rules (no RSC-specific linting)

**How to avoid:**
1. **Override noDefaultExport for App Router files:**
   ```json
   {
     "overrides": [
       {
         "includes": [
           "**/src/app/**/page.tsx",
           "**/src/app/**/layout.tsx",
           "**/src/app/**/error.tsx"
         ],
         "linter": {
           "rules": {
             "style": {
               "noDefaultExport": "off"
             }
           }
         }
       }
     ]
   }
   ```
2. **Exclude shadcn/ui:**
   ```json
   {
     "linter": {
       "includes": ["**"],
       "excludes": ["**/src/components/ui/*"]
     }
   }
   ```
3. **Enable Next.js domain:**
   ```json
   {
     "linter": {
       "domains": {
         "next": "all",
         "react": "all"
       }
     }
   }
   ```

**Warning signs:**
- Lint errors: "Named export preferred over default export"
- Hundreds of lint errors in `components/ui/` folder
- Missing RSC boundary warnings

**Reference:** [Biome Next.js Integration](https://biomejs.dev/guides/integrate-in-vcs/)

### Pitfall 7: Lefthook Not Running on Commit

**What goes wrong:**
- Forgetting to run `lefthook install` after adding lefthook.yml
- commitlint script not executable
- Wrong matcher in lefthook.yml (no files matched)

**How to avoid:**
1. **Install hooks:**
   ```bash
   bunx lefthook install
   ```
2. **Make commitlint.sh executable:**
   ```bash
   chmod +x .lefthook/commit-msg/commitlint.sh
   ```
3. **Correct glob patterns:**
   ```yaml
   pre-commit:
     commands:
       lint:
         glob: "*.{js,ts,jsx,tsx,json,jsonc}" # ✓ Matches staged files
         run: bun lint --files-ignore-unknown=true {staged_files}
   ```
4. **Test manually:**
   ```bash
   bunx lefthook run pre-commit
   ```

**Warning signs:**
- Commits succeed with lint errors
- Commitlint not enforcing conventional commits
- Type errors not caught before push

**Reference:** [Lefthook Documentation](https://github.com/evilmartians/lefthook)

## Code Examples

### Example 1: Complete next.config.ts

```typescript
import createNextIntlPlugin from 'next-intl/plugin';
import './src/env/client'; // Validates env at build time

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Enable Turbopack for dev (2-5x faster builds)
  // No config needed - use: bun dev --turbopack

  // Image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Transpile @t3-oss/env-nextjs for edge compatibility
  transpilePackages: ['@t3-oss/env-nextjs', '@t3-oss/env-core'],

  // Enable typed routes (optional, adds type safety to Link href)
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
```

**Source:** Reference template next.config.ts

### Example 2: Intent Submissions Schema

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Enums match REQUIREMENTS.md intent types
export const intentEnum = pgEnum('intent', ['build', 'collaborate', 'connect']);
export const localeEnum = pgEnum('locale', ['es', 'en']);

export const intentSubmissions = pgTable('intent_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  intent: intentEnum('intent').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  locale: localeEnum('locale').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export type for use in Server Actions (Phase 3)
export type IntentSubmission = typeof intentSubmissions.$inferSelect;
```

**Why this schema:**
- UUID primary key (better for distributed systems than auto-increment)
- Enums enforce data integrity at database level
- Timestamp with timezone (correct for multi-region)
- Minimal fields (no over-engineering in Phase 1)

### Example 3: Locale Layout with Fonts and Metadata

```typescript
// src/app/[locale]/layout.tsx
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { inter, orbitron } from '@/styles/fonts';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          orbitron.variable
        )}
      >
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Source:** Reference template app/[locale]/layout.tsx (adapted for 404 Tech Found)

### Example 4: Empty Landing Page (Phase 1 Success Criteria)

```typescript
// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-2xl p-8 space-y-6">
        <h1 className="font-orbitron text-6xl font-bold text-glow-purple gradient-purple bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>

        <div className="flex gap-4">
          <div className="p-4 border border-gray-200 rounded-lg glow-border-ai">
            <p className="text-house-ai">AI House</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg glow-border-biotech">
            <p className="text-house-biotech">Biotech House</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg glow-border-hardware">
            <p className="text-house-hardware">Hardware House</p>
          </div>
        </div>

        <p className="text-muted-foreground">
          Phase 1 Foundation Complete ✓
        </p>
      </div>
    </main>
  );
}
```

**Why this implementation:**
- Tests Orbitron font loading (`font-orbitron`)
- Tests Tailwind v4 custom utilities (`text-glow-purple`, `gradient-purple`)
- Tests house colors (`text-house-ai`, etc.)
- Tests glow border utilities (`glow-border-*`)
- Tests next-intl Server Component API (`getTranslations`)
- Visible proof that foundation works before Phase 2

### Example 5: Translation Message Files

```json
// messages/es.json (excerpt)
{
  "landing": {
    "hero": {
      "title": "404 Tech Found",
      "subtitle": "Laboratorio de Innovación Deeptech"
    }
  }
}
```

```json
// messages/en.json (excerpt)
{
  "landing": {
    "hero": {
      "title": "404 Tech Found",
      "subtitle": "Deeptech Innovation Lab"
    }
  }
}
```

**Why this structure:**
- Namespaced by feature (`landing`, `nav`, `form`)
- Nested keys match component hierarchy
- Same structure across locales (easy to maintain)
- Type-safe with next-intl (auto-generated types)

## State of the Art

| Old Approach (2024) | Current Approach (2026) | Impact |
|---------------------|-------------------------|--------|
| **Pages Router** | App Router | Required for Next.js 16, RSC support, better SEO |
| **middleware.ts** | proxy.ts | Breaking change in Next.js 16 |
| **Tailwind v3** | Tailwind v4 | 3.78x faster builds, CSS-first config, breaking syntax changes |
| **ESLint + Prettier** | Biome | 56x faster, single tool, Next.js domain rules |
| **Husky** | Lefthook | Parallel execution, faster, language-agnostic |
| **React Hook Form** | TanStack Forms | Better nested state, more type-safe (but see pitfalls) |
| **Prisma** | Drizzle ORM | Lighter weight, serverless-first, less opinionated |

## Open Questions

1. **Tailwind v4.1.x Turbopack Compatibility**
   - What we know: v4.1.18 has confirmed build failures with Turbopack
   - What's unclear: Exact version when fix landed, whether v4.2+ is stable
   - Recommendation: Use `tailwindcss@~4.0.0` in package.json to stay on v4.0.x branch until Turbopack compatibility confirmed in changelog

2. **@t3-oss/env-nextjs Next.js 16 Support**
   - What we know: Package version 0.13.10 exists, no explicit "Next.js 16" in docs
   - What's unclear: Whether any edge cases exist with App Router or Turbopack
   - Recommendation: Use as documented (HIGH confidence based on reference template success), but test build-time validation thoroughly in Plan 01-03

3. **Bun + Drizzle Kit Compatibility**
   - What we know: Bun 1.3.8+ is production-ready, drizzle-kit works with Node.js
   - What's unclear: Whether `bun run db:generate` works identically to `node` execution
   - Recommendation: Use `bun run` for all scripts (reference template proves this works), but if issues arise, use `bunx --bun drizzle-kit` to force Bun runtime

4. **shadcn/ui Tailwind v4 Full Compatibility**
   - What we know: shadcn/ui docs confirm Tailwind v4 support, reference template works
   - What's unclear: Whether all shadcn components tested with v4 (some may use v3 syntax)
   - Recommendation: Initialize shadcn/ui early in Plan 01-02, test with `bunx shadcn add button card` before full component migration

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Features, middleware → proxy.ts rename
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) - Breaking changes, @import syntax
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router) - defineRouting API, proxy.ts example
- [Drizzle ORM Neon Quickstart](https://orm.drizzle.team/docs/get-started/neon-new) - Serverless driver setup
- [T3 Env Next.js Docs](https://env.t3.gg/docs/nextjs) - Build-time validation patterns
- [Biome 2.3 Release](https://biomejs.dev/blog/roadmap-2026/) - Next.js domain support
- Reference template: `/home/hybridz/Projects/next-fullstack-template` - All patterns verified in working Next.js 16 project

### Secondary (MEDIUM confidence)
- [Tailwind v4.1.18 Turbopack Issue](https://github.com/tailwindlabs/tailwindcss/discussions/19556) - Known bug discussion
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - RSC mode setup
- [Lefthook Documentation](https://github.com/evilmartians/lefthook) - Hook configuration examples
- Content source: `/home/hybridz/Projects/deep-tech-nexus` - Existing theme CSS variables

### Tertiary (LOW confidence)
- npm registry versions (verified 2026-02-08): next@16.1.6, next-intl@4.8.2, @biomejs/biome@2.3.10

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified in reference template, versions confirmed via npm
- Architecture patterns: HIGH - 10 patterns extracted from working Next.js 16 project with identical stack
- Pitfalls: HIGH - 7 pitfalls documented with prevention strategies from existing .planning/research/PITFALLS.md
- Code examples: HIGH - All examples adapted from reference template with exact file paths

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days for stable stack)

**Research methodology:**
1. Loaded existing domain research from .planning/research/ (STACK.md, ARCHITECTURE.md, PITFALLS.md)
2. Examined reference Next.js 16 template at /home/hybridz/Projects/next-fullstack-template
3. Analyzed existing Vite/React SPA at /home/hybridz/Projects/deep-tech-nexus for theme/content
4. Cross-referenced all patterns against official Next.js 16, Tailwind v4, next-intl v4 documentation
5. Verified package versions via npm registry (2026-02-08)

**Single source of truth principle applied:**
- next.config.ts: Reference template pattern (exact file)
- Tailwind theme: deep-tech-nexus CSS variables (adapted to v4 syntax)
- i18n setup: next-intl v4 official docs + reference template proxy.ts
- Database schema: REQUIREMENTS.md intent_submissions spec + Drizzle best practices
- All configs: Reference template (biome.jsonc, lefthook.yml, knip.config.ts) with minimal adaptation
