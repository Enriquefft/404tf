# Phase 1: Foundation - Research

**Researched:** 2026-02-13
**Domain:** Next.js 16 App Router with Tailwind v4, next-intl, Framer Motion, Drizzle ORM
**Confidence:** HIGH

## Summary

Phase 1 establishes the architectural foundation for migrating a Vite/React SPA (SpecHack) to Next.js 16 within an existing monorepo that already has working patterns. The landing app (`apps/landing/`) serves as the authoritative reference for all architectural decisions: next-intl configuration with always-prefix routing, Tailwind v4 CSS-first theming, Framer Motion wrapper components to prevent client component cascade, and shared Drizzle ORM schema with app-specific table prefixes.

The key insight is that this is NOT a greenfield project—the monorepo already has established patterns, dependencies, and configurations. The task is to replicate these patterns for the spechack app while maintaining consistency with the existing codebase.

**Primary recommendation:** Use the landing app as the single source of truth. Copy and adapt its configuration files, folder structure, and architectural patterns rather than researching alternatives. The only significant deviation is the theme (blueprint grid + purple/cyan vs landing's purple-based theme).

## Standard Stack

### Core Dependencies (from apps/landing/package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | latest | Framework | Next.js 16 with App Router, RSC, Turbopack |
| react | latest | UI Library | React 19.2 with React Compiler |
| next-intl | latest | i18n | Official Next.js i18n solution with App Router support |
| framer-motion | ^12.34.0 | Animations | Industry standard for React animations |
| tailwindcss | ~4.0.0 | Styling | CSS-first v4 architecture (pinned due to Turbopack bug) |
| drizzle-orm | latest | Database ORM | Type-safe PostgreSQL ORM with excellent DX |
| zod | latest | Validation | TypeScript-first schema validation |
| clsx | latest | Class utilities | Conditional className composition |
| tailwind-merge | latest | Class utilities | Tailwind className deduplication |

### Supporting Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @404tf/database | workspace:* | Shared DB package | Always—contains Drizzle schema and client |
| @404tf/config | workspace:* | Shared config | Always—contains Biome and tsconfig |
| @neondatabase/serverless | latest | Database driver | In @404tf/database package |
| lucide-react | ^0.563.0 | Icons | When icons needed |
| react-intersection-observer | ^10.0.2 | Scroll animations | For scroll-triggered reveals |

### Alternatives NOT Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-translate, react-i18next | Landing app already uses next-intl—maintain consistency |
| Tailwind v4 ~4.0.0 | Tailwind v4.1.18+ | v4.1.18+ has critical Turbopack build failure bug |
| Drizzle ORM | Prisma, TypeORM | Monorepo already standardized on Drizzle |
| Biome | ESLint + Prettier | Monorepo already standardized on Biome |

**Installation:**
```bash
# All dependencies already in monorepo—just add spechack app
cd apps/spechack/
bun add next react react-dom next-intl framer-motion clsx tailwind-merge zod lucide-react
bun add -D @types/node @types/react @types/react-dom typescript tailwindcss @tailwindcss/postcss postcss
```

**CRITICAL:** Pin tailwindcss to `~4.0.0` range to avoid v4.1.18 Turbopack bug.

## Architecture Patterns

### Recommended Project Structure
```
apps/spechack/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx         # Locale-aware layout with next-intl provider
│   │   │   ├── page.tsx           # Home page (server component)
│   │   │   ├── _components/       # Private components (route-level)
│   │   │   └── _actions/          # Server actions (.actions.ts suffix)
│   │   ├── layout.tsx             # Root layout (fonts, metadata)
│   │   └── not-found.tsx          # 404 page
│   ├── i18n/
│   │   ├── routing.ts             # next-intl routing config
│   │   └── request.ts             # next-intl request config
│   ├── proxy.ts                   # next-intl middleware (MUST be at src/proxy.ts)
│   ├── hooks/                     # Custom React hooks (use* prefix)
│   ├── lib/                       # Utilities and helpers
│   └── styles/
│       └── globals.css            # Tailwind imports + theme CSS variables
├── messages/
│   ├── es.json                    # Spanish translations
│   └── en.json                    # English translations
├── public/                        # Static assets
├── next.config.ts                 # Next.js config with next-intl plugin
├── package.json                   # Dependencies (workspace packages)
└── tsconfig.json                  # Extends @404tf/config/tsconfig.base.json
```

### Pattern 1: next-intl Always-Prefix Routing

**What:** Every route is prefixed with locale (`/es/*`, `/en/*`). No locale-less routes.

**When to use:** Always—this is the monorepo standard.

**Example:**
```typescript
// src/i18n/routing.ts
// Source: apps/landing/src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["es", "en"],
	defaultLocale: "es",
	localePrefix: "always",  // CRITICAL: Forces /es/ and /en/ prefixes
});
```

```typescript
// src/proxy.ts (MUST be at this exact path)
// Source: apps/landing/src/proxy.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
	matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

```typescript
// src/app/[locale]/layout.tsx
// Source: apps/landing/src/app/[locale]/layout.tsx
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

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

	setRequestLocale(locale);  // Important for static generation

	return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
```

### Pattern 2: Tailwind v4 CSS-First Theming

**What:** Theme variables defined in CSS using `@theme` directive, not JavaScript config. HSL color tokens in `:root`, consumed via `@theme`.

**When to use:** Always—Tailwind v4's new architecture.

**Example:**
```css
/* src/styles/globals.css */
/* Source: apps/landing/src/styles/globals.css + spechack-blueprint/src/index.css */
@import "tailwindcss";

@theme {
	/* Color tokens - consume HSL variables from :root */
	--color-background: hsl(var(--background));
	--color-foreground: hsl(var(--foreground));
	--color-primary: hsl(var(--primary));
	--color-secondary: hsl(var(--secondary));
	--color-spec-green: hsl(var(--spec-green));
	--color-border: hsl(var(--border));
	--color-input: hsl(var(--input));
	--color-ring: hsl(var(--ring));

	/* Radius tokens */
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
}

:root {
	/* SpecHack theme - dark with purple/cyan accents */
	/* Source: spechack-blueprint/src/index.css */
	--background: 240 10% 6.7%;     /* Dark blue-gray */
	--foreground: 0 0% 98%;          /* Near white */
	--primary: 261 85% 50%;          /* Purple */
	--secondary: 199 95% 60%;        /* Cyan */
	--spec-green: 142 71% 45%;       /* Accent green */
	--border: 240 6% 20%;
	--input: 240 6% 20%;
	--ring: 261 85% 50%;
	--radius: 0.5rem;
}

@layer base {
	* {
		border-color: hsl(var(--border));
	}
	body {
		background-color: hsl(var(--background));
		color: hsl(var(--foreground));
		font-family: var(--font-inter, "Inter"), sans-serif;
	}
	h1, h2, h3, h4, h5, h6 {
		font-family: var(--font-orbitron, "Orbitron"), sans-serif;
	}
}

/* Blueprint grid background */
/* Source: spechack-blueprint/src/index.css */
@layer utilities {
	.blueprint-grid {
		background-image:
			linear-gradient(rgba(94, 23, 235, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(94, 23, 235, 0.03) 1px, transparent 1px);
		background-size: 40px 40px;
	}

	.purple-glow {
		text-shadow: 0 0 20px rgba(94, 23, 235, 0.5), 0 0 40px rgba(94, 23, 235, 0.3);
	}

	.font-orbitron {
		font-family: var(--font-orbitron, "Orbitron"), sans-serif;
	}

	.font-mono-accent {
		font-family: var(--font-mono, "JetBrains Mono"), monospace;
		letter-spacing: 0.05em;
	}
}
```

**CRITICAL:** No `@apply` with theme variables—use direct CSS properties or utility classes. Tailwind v4 changed this.

### Pattern 3: Framer Motion Wrapper Components

**What:** Create "use client" wrapper components for motion.div, motion.section, etc. to prevent client component cascade.

**When to use:** Always—allows server components to use animations without becoming client components.

**Example:**
```typescript
// src/app/[locale]/_components/animations/FadeInSection.tsx
// Source: apps/landing/src/app/[locale]/_components/animations/FadeInSection.tsx
"use client";

import { motion } from "framer-motion";

type FadeInSectionProps = {
	children: React.ReactNode;
	className?: string;
};

export function FadeInSection({ children, className }: FadeInSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, margin: "-80px" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
```

**Usage in server component:**
```typescript
// src/app/[locale]/page.tsx
import { FadeInSection } from "./_components/animations/FadeInSection";
import { HeroSection } from "./_components/HeroSection";  // Server component

export default function HomePage() {
	return (
		<main>
			<FadeInSection>
				<HeroSection />  {/* Remains a server component */}
			</FadeInSection>
		</main>
	);
}
```

### Pattern 4: Server Actions + useActionState + Zod Validation

**What:** Form handling pattern using React 19's useActionState hook, Server Actions, and Zod validation.

**When to use:** All form submissions (registration, ambassador application).

**Example:**
```typescript
// src/app/[locale]/_actions/registration.actions.ts
"use server";

import { z } from "zod";
import { db } from "@404tf/database";
import { spechackParticipants } from "@404tf/database/schema";

const registrationSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	locale: z.enum(["es", "en"]),
});

export type FormState = {
	success: boolean;
	message: string;
	errors?: {
		name?: string[];
		email?: string[];
	};
} | null;

export async function submitRegistration(
	_prevState: FormState,
	formData: FormData
): Promise<FormState> {
	try {
		const rawData = {
			name: formData.get("name"),
			email: formData.get("email"),
			locale: formData.get("locale"),
		};

		const validation = registrationSchema.safeParse(rawData);

		if (!validation.success) {
			return {
				success: false,
				message: "Validation failed",
				errors: validation.error.flatten().fieldErrors,
			};
		}

		await db.insert(spechackParticipants).values(validation.data);

		return {
			success: true,
			message: "success",
		};
	} catch (error) {
		console.error("Database error:", error);
		return {
			success: false,
			message: "Database error. Please try again.",
		};
	}
}
```

```typescript
// src/app/[locale]/_components/RegistrationForm.tsx
"use client";

import { useActionState } from "react";
import { submitRegistration } from "../_actions/registration.actions";

export function RegistrationForm() {
	const [state, formAction, isPending] = useActionState(submitRegistration, null);

	return (
		<form action={formAction}>
			<input name="name" required />
			{state?.errors?.name && <p>{state.errors.name[0]}</p>}

			<input name="email" type="email" required />
			{state?.errors?.email && <p>{state.errors.email[0]}</p>}

			<button disabled={isPending}>
				{isPending ? "Submitting..." : "Submit"}
			</button>

			{state?.success && <p>{state.message}</p>}
		</form>
	);
}
```

### Pattern 5: Translation Prop-Drilling (Server → Client)

**What:** Server components fetch translations with `getTranslations()`, pass translated strings as props to client components.

**When to use:** Any client component that needs translated text.

**Example:**
```typescript
// src/app/[locale]/page.tsx (Server Component)
import { getTranslations } from "next-intl/server";
import { HeroClient } from "./_components/HeroClient";

export default async function HomePage() {
	const t = await getTranslations("hero");

	return (
		<HeroClient
			translations={{
				title: t("title"),
				subtitle: t("subtitle"),
				cta: t("cta"),
			}}
		/>
	);
}
```

```typescript
// src/app/[locale]/_components/HeroClient.tsx (Client Component)
"use client";

type HeroClientProps = {
	translations: {
		title: string;
		subtitle: string;
		cta: string;
	};
};

export function HeroClient({ translations }: HeroClientProps) {
	return (
		<div>
			<h1>{translations.title}</h1>
			<p>{translations.subtitle}</p>
			<button>{translations.cta}</button>
		</div>
	);
}
```

### Pattern 6: Font Loading with next/font

**What:** Load Google Fonts (Orbitron, Inter, JetBrains Mono) using next/font/google in root layout.

**When to use:** Always—for custom fonts.

**Example:**
```typescript
// src/app/layout.tsx
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
	weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
			<body>{children}</body>
		</html>
	);
}
```

### Anti-Patterns to Avoid

- **proxy.ts inside src/app/**: Causes next-intl to fail. Must be at `src/proxy.ts`.
- **@apply with theme variables**: Tailwind v4 doesn't support this. Use direct CSS or utility classes.
- **Default exports everywhere**: Only Next.js special files (page.tsx, layout.tsx, error.tsx) use default exports.
- **Client component cascade**: Don't import Framer Motion directly in server components—use wrapper components.
- **Runtime dictionary lookups in client components**: Pass translated strings as props from server components.
- **Tailwind v4.1.18+**: Has critical Turbopack build failure bug. Use ~4.0.0.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| i18n routing | Custom locale detection and routing | next-intl with createMiddleware | Handles locale detection, redirects, cookie persistence, static generation |
| Form state management | Custom useState + error handling | useActionState + Server Actions | Built-in pending states, progressive enhancement, type-safe |
| CSS theming | CSS-in-JS, Sass variables | Tailwind v4 @theme + CSS variables | First-class theme support, type hints, IntelliSense |
| Animation orchestration | Custom intersection observers | Framer Motion whileInView | Handles viewport detection, performance optimization, gesture support |
| Database migrations | Custom SQL scripts | Drizzle Kit (db:generate, db:push) | Auto-generates migrations from schema changes, type-safe |
| TypeScript config | Per-app tsconfig | Shared @404tf/config/tsconfig.base.json | Consistent compiler options across monorepo |
| Code formatting | Manual style guides | Biome (workspace:*) | Fast, opinionated, works with monorepo structure |

**Key insight:** The monorepo already has solutions for all common problems. Don't reinvent—reuse.

## Common Pitfalls

### Pitfall 1: Tailwind v4.1.18+ Turbopack Build Failure
**What goes wrong:** Build fails with "invalid code point" error during PostCSS processing.
**Why it happens:** Bug introduced between v4.0.7 and v4.1.18 where PostCSS plugin receives invalid code point, and Turbopack has no error recovery.
**How to avoid:** Pin `tailwindcss` and `@tailwindcss/postcss` to `~4.0.0` range in package.json.
**Warning signs:** Build succeeds in Webpack but fails in Turbopack; error mentions "code point" or "PostCSS".
**Source:** [GitHub Discussion #88443](https://github.com/vercel/next.js/discussions/88443)

### Pitfall 2: proxy.ts Location Mistake
**What goes wrong:** next-intl middleware doesn't run; locale detection fails; routes 404.
**Why it happens:** next-intl expects middleware at `src/proxy.ts`, but developer puts it in `src/app/proxy.ts` or `src/middleware.ts`.
**How to avoid:** Always place next-intl middleware at `src/proxy.ts` (same level as `src/app/`).
**Warning signs:** Locale routing doesn't work; browser stays on `/` instead of redirecting to `/es/` or `/en/`.
**Source:** Project CLAUDE.md + next-intl docs

### Pitfall 3: Client Component Cascade from Framer Motion
**What goes wrong:** Importing `motion` directly in a component makes it a client component, forcing all parents to become client components.
**Why it happens:** Framer Motion's motion components require DOM access ("use client").
**How to avoid:** Create wrapper components (MotionDiv, FadeInSection) marked as "use client", import wrappers in server components.
**Warning signs:** Getting "use client" directive warnings; losing server component benefits (streaming, smaller bundles).
**Source:** [How to use Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)

### Pitfall 4: @apply with Tailwind v4 Theme Variables
**What goes wrong:** Build fails or styles don't apply when using `@apply` with theme variables.
**Why it happens:** Tailwind v4 changed how theme variables work—they're now in `@theme`, not accessible via `@apply`.
**How to avoid:** Use direct CSS properties (`color: hsl(var(--primary))`) or utility classes (`text-primary`).
**Warning signs:** Build warnings about unknown `@apply` values; styles not rendering.
**Source:** [Tailwind CSS v4.0 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)

### Pitfall 5: Shared Schema Namespace Collision
**What goes wrong:** Tables from different apps overwrite each other or cause migration conflicts.
**Why it happens:** Multiple apps share @404tf/database package without table prefixes.
**How to avoid:** Prefix all tables with app name (`spechack_participants`, not `participants`). Use app-specific enums (`spechack_locale`, not `locale`).
**Warning signs:** Migration conflicts; foreign key errors; table not found in one app.
**Source:** [Drizzle ORM monorepo discussions](https://github.com/drizzle-team/drizzle-orm/discussions/885)

### Pitfall 6: Forgetting setRequestLocale in Page
**What goes wrong:** Static generation fails; locale not available in server components.
**Why it happens:** next-intl needs `setRequestLocale(locale)` called at top of each page for static rendering.
**How to avoid:** Always call `setRequestLocale(locale)` first thing in page.tsx and layout.tsx.
**Warning signs:** Locale undefined in getTranslations; static build errors.
**Source:** next-intl documentation + apps/landing reference

### Pitfall 7: Not Using Workspace Packages
**What goes wrong:** Reinstalling duplicate dependencies; config drift between apps; schema type mismatches.
**Why it happens:** Developer installs dependencies locally instead of using workspace:* packages.
**How to avoid:** Always use `@404tf/database`, `@404tf/config` via workspace:* imports.
**Warning signs:** node_modules bloat; Biome config not applied; schema types not resolving.
**Source:** Monorepo package.json inspection

## Code Examples

### Example 1: next.config.ts with next-intl Plugin
```typescript
// Source: apps/landing/next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	transpilePackages: [
		"@404tf/database",  // Required for workspace packages
		"@404tf/config",
	],
};

export default withNextIntl(nextConfig);
```

### Example 2: Shared Database Schema Extension
```typescript
// Source: packages/database/src/schema.ts (add spechack tables)
import { pgSchema, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const schema = pgSchema("404 Tech Found");

// Existing landing app enums
export const intentEnum = schema.enum("landing_intent", ["build", "collaborate", "connect"]);
export const localeEnum = schema.enum("landing_locale", ["es", "en"]);

// NEW: SpecHack-specific enums
export const spechackLocaleEnum = schema.enum("spechack_locale", ["es", "en"]);
export const ambassadorStatusEnum = schema.enum("spechack_ambassador_status", ["pending", "approved", "rejected"]);

// Existing landing app tables
export const intentSubmissions = schema.table("intent_submissions", {
	id: uuid("id").defaultRandom().primaryKey(),
	intent: intentEnum("intent").notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	locale: localeEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// NEW: SpecHack participant registrations
export const spechackParticipants = schema.table("spechack_participants", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	locale: spechackLocaleEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// NEW: SpecHack ambassador applications
export const spechackAmbassadors = schema.table("spechack_ambassadors", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	university: text("university").notNull(),
	motivation: text("motivation").notNull(),
	status: ambassadorStatusEnum("status").notNull().default("pending"),
	locale: spechackLocaleEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type inference
export type IntentSubmission = typeof intentSubmissions.$inferSelect;
export type NewIntentSubmission = typeof intentSubmissions.$inferInsert;
export type SpechackParticipant = typeof spechackParticipants.$inferSelect;
export type NewSpechackParticipant = typeof spechackParticipants.$inferInsert;
export type SpechackAmbassador = typeof spechackAmbassadors.$inferSelect;
export type NewSpechackAmbassador = typeof spechackAmbassadors.$inferInsert;
```

### Example 3: Message Files Structure
```json
// messages/es.json
{
	"hero": {
		"title": "SpecHack 2024",
		"subtitle": "El hackathon universitario más grande de Honduras",
		"cta": "Regístrate ahora"
	},
	"registration": {
		"name": "Nombre completo",
		"email": "Correo electrónico",
		"submit": "Registrarse",
		"success": "¡Registro exitoso!",
		"errorName": "El nombre debe tener al menos 2 caracteres",
		"errorEmail": "Correo electrónico inválido"
	}
}
```

```json
// messages/en.json
{
	"hero": {
		"title": "SpecHack 2024",
		"subtitle": "Honduras' largest university hackathon",
		"cta": "Register now"
	},
	"registration": {
		"name": "Full name",
		"email": "Email address",
		"submit": "Register",
		"success": "Registration successful!",
		"errorName": "Name must be at least 2 characters",
		"errorEmail": "Invalid email address"
	}
}
```

### Example 4: Biome Configuration Reference
```jsonc
// Source: packages/config/biome.jsonc (already exists)
{
	"formatter": {
		"enabled": true,
		"indentStyle": "tab",      // Use tabs
		"lineWidth": 100
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double"   // Use double quotes
		}
	},
	"linter": {
		"rules": {
			"correctness": {
				"useUniqueElementIds": "off"  // Disabled for anchor navigation
			}
		}
	}
}
```

### Example 5: TypeScript Configuration
```json
// apps/spechack/tsconfig.json
{
	"extends": "@404tf/config/tsconfig.base.json",
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["./src/*"]  // Path alias for imports
		},
		"jsx": "preserve",
		"plugins": [
			{
				"name": "next"  // Next.js TypeScript plugin
			}
		]
	},
	"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
	"exclude": ["node_modules"]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 JS config | Tailwind v4 CSS @theme | Jan 2025 (v4.0 release) | Faster builds, CSS-first theming, no tailwind.config.js |
| next-intl App Router Beta | next-intl stable with App Router | 2024 | Production-ready i18n for App Router |
| React 18 | React 19 with Compiler | Next.js 16 (Dec 2024) | Auto-memoization, useActionState, View Transitions |
| Drizzle InferModel | table.$inferSelect/$inferInsert | Drizzle v0.28.3 (2023) | More explicit type inference |
| Optional prefetch | Incremental prefetch by default | Next.js 16 | Faster navigation, less data transfer |

**Deprecated/outdated:**
- **tailwind.config.js**: Now replaced by @theme in CSS (Tailwind v4)
- **@tailwind directives**: Now replaced by @import "tailwindcss" (Tailwind v4)
- **InferModel**: Use table.$inferSelect and table.$inferInsert instead (Drizzle)
- **pages/ directory**: Use app/ directory with App Router (Next.js 13+)
- **getStaticProps/getServerSideProps**: Use async React Server Components (Next.js 13+)

## Open Questions

1. **Database migration strategy**
   - What we know: Shared database package already exists with landing tables
   - What's unclear: Should spechack tables be in same Postgres database or separate schema?
   - Recommendation: Use same database (simpler), rely on table prefixes for separation

2. **OG image generation**
   - What we know: Landing app has `/opengraph-image` route for dynamic OG images
   - What's unclear: Should spechack reuse landing's OG pattern or create custom?
   - Recommendation: Create spechack-specific OG image with event branding

3. **Environment variable management**
   - What we know: DATABASE_URL needed, NEXT_PUBLIC_SITE_URL needed
   - What's unclear: Should spechack have separate .env or share with landing?
   - Recommendation: Separate .env at apps/spechack/.env, but share DATABASE_URL (same DB)

## Sources

### Primary (HIGH confidence)
- **apps/landing/package.json** - Verified dependency versions (Next.js latest, Tailwind ~4.0.0, framer-motion ^12.34.0)
- **apps/landing/src/i18n/** - Verified next-intl configuration pattern (always-prefix routing)
- **apps/landing/src/proxy.ts** - Verified middleware location and matcher config
- **apps/landing/src/app/[locale]/layout.tsx** - Verified locale layout pattern
- **apps/landing/src/styles/globals.css** - Verified Tailwind v4 @theme pattern
- **packages/database/src/schema.ts** - Verified Drizzle schema structure and naming conventions
- **packages/config/biome.jsonc** - Verified Biome formatting rules (tabs, double quotes, 100 line width)
- **spechack-blueprint/src/index.css** - Verified blueprint theme colors and utilities
- **spechack-blueprint/tailwind.config.ts** - Verified font family configuration

### Secondary (MEDIUM confidence)
- [Next.js 16 App Router Documentation](https://nextjs.org/docs/app) - Verified App Router best practices
- [Tailwind CSS v4.0 Migration Guide](https://tailwindcss.com/docs/upgrade-guide) - Verified @theme pattern
- [next-intl Routing Configuration](https://next-intl.dev/docs/routing/configuration) - Verified always-prefix setup
- [GitHub Issue #88443: Tailwind v4.1.18 Turbopack Bug](https://github.com/vercel/next.js/discussions/88443) - Verified Turbopack build failure

### Tertiary (LOW confidence)
- [Framer Motion Server Components Pattern](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) - Community article on wrapper pattern
- [Drizzle ORM Monorepo Discussion](https://github.com/drizzle-team/drizzle-orm/discussions/885) - Community discussion on shared schemas

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies verified in monorepo package.json files
- Architecture patterns: HIGH - All patterns verified in working landing app
- Tailwind v4 Turbopack bug: HIGH - Verified in GitHub issue with maintainer confirmation
- Pitfalls: MEDIUM to HIGH - Most verified in codebase, some from documentation

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days - stack is stable)
