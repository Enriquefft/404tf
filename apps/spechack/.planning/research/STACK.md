# Technology Stack

**Project:** SpecHack — Hackathon Landing Page
**Researched:** 2026-02-13
**Confidence:** HIGH (verified with official docs, monorepo patterns, and current versions)

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | ^16.1.6 | Full-stack React framework | App Router with React 19.2, Server Components, built-in OG image generation, Turbopack as default bundler. Landing app proven pattern. |
| React | ^19.2.0 | UI library | Latest stable with View Transitions API, useEffectEvent, Server Components. Required for Next.js 16. |
| TypeScript | ^5.7.3 | Type safety | Strict mode with ESNext target. Monorepo standard. |
| Bun | 1.x | Runtime & package manager | 28% faster than Node.js for Next.js, native Vercel support. Monorepo standard (not npm/yarn). |

### Internationalization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next-intl | ^4.8.2 | i18n for Next.js App Router | Next.js-native i18n with Server Components support, static rendering, SEO-friendly URL prefixing. Proven pattern from landing app. Note: `use cache` requires upcoming `next/root-params` API. |

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Drizzle ORM | ^0.45.1 | Type-safe ORM | TypeScript-first, native Neon support with neon-http/neon-serverless drivers for edge runtime. Proven monorepo pattern via @404tf/database. |
| Neon Postgres | serverless | Production database | Serverless Postgres with edge-compatible drivers, 1.0.2 serverless client. Shared with landing app. |
| @neondatabase/serverless | ^1.0.2 | Neon driver | HTTP/WebSocket connection for edge runtime (Vercel). |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ~4.0.0 | Utility-first CSS | Pin to 4.0.x due to CRITICAL BUG in v4.1.18 with Next.js 16 Turbopack (RangeError in markUsedVariable). Monorepo uses 4.0.7. |
| @tailwindcss/postcss | latest | Tailwind v4 PostCSS plugin | Required for Tailwind v4 integration with Next.js 16. |
| PostCSS | latest | CSS processor | Required for Tailwind v4. |

### Validation & Forms

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | ^4.3.6 | Schema validation | Industry standard for Next.js Server Actions validation via safeParse(). Security-critical for input validation. Proven landing app pattern. |

### Animations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Framer Motion | ^12.34.0 | Animation library | v12 with full React 19.2 compatibility, improved layout animations, concurrent rendering support. Must wrap in client components ("use client"). Landing app proven. |

### Image Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/og | (built-in) | Dynamic OG images | Built into Next.js 16, renders JSX to PNG for social preview cards. File convention: opengraph-image.tsx. Uses Satori rendering (Flexbox only, no Grid/calc). |
| Canvas API | (browser native) | Client-side PNG export | Standard browser API for trading card PNG export via canvas.toDataURL(). Requires "use client" component with useEffect. |

### Code Quality

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Biome | latest | Linting & formatting | Monorepo standard via @404tf/config. Tabs, double quotes, 100 char line width. Faster than ESLint+Prettier. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | latest | Conditional classes | Combine with tailwind-merge for dynamic Tailwind classes. Landing app pattern. |
| tailwind-merge | latest | Merge Tailwind classes | Deduplicate conflicting utility classes in component props. Landing app pattern. |
| react-intersection-observer | ^10.0.2 | Scroll animations | Trigger Framer Motion animations on scroll. Landing app proven. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| i18n | next-intl | next-i18next | next-i18next is Pages Router-focused, next-intl is App Router-native with better Server Components support. |
| i18n | next-intl | Custom context | Monorepo consistency, SEO-friendly URLs, proven pattern. |
| ORM | Drizzle | Prisma | Drizzle is lighter, TypeScript-first, edge-compatible. Monorepo standard. |
| Validation | Zod | yup / joi | Zod has best TypeScript inference, safeParse for Server Actions. Industry standard for Next.js. |
| Animations | Framer Motion | Motion (new library) | Framer Motion v12 is stable, proven in landing app. Motion is next-gen but less mature. |
| Styling | Tailwind v4 | Tailwind v3 | v4 is stable, monorepo is on v4. Just pin to 4.0.x to avoid Turbopack bug. |
| Styling | Tailwind v4 | shadcn/ui | Only need 1 component (Accordion). Avoid heavy dependency. Port directly. |
| Runtime | Bun | Node.js | Bun 28% faster for Next.js, Vercel native support. Monorepo standard. Known issues with 1.3.2-1.3.6 + Next.js 16.1.2. |
| Canvas Export | Canvas API | Server-side rendering | Trading cards need client-side export (user download). Canvas API is standard. |
| OG Images | next/og | @vercel/og | next/og is preferred for Next.js projects, maintained in-framework. |
| OG Images | next/og | Bannerbear/external | next/og is free, built-in, no external service needed. |

## Installation

```bash
# Core dependencies (add to apps/spechack/package.json)
bun add next@^16.1.6 react@^19.2.0 react-dom@^19.2.0
bun add next-intl@latest
bun add drizzle-orm@latest @neondatabase/serverless@latest
bun add zod@latest
bun add framer-motion@latest
bun add clsx@latest tailwind-merge@latest
bun add react-intersection-observer@latest

# Dev dependencies
bun add -D @types/node@latest @types/react@latest @types/react-dom@latest
bun add -D typescript@latest
bun add -D tailwindcss@~4.0.0 @tailwindcss/postcss@latest postcss@latest

# Workspace packages (already available)
# - @404tf/config (Biome, tsconfig)
# - @404tf/database (Drizzle schema, Neon connection)
```

## Critical Constraints

### Tailwind v4.1.18 Turbopack Bug

**Problem:** Tailwind CSS v4.1.18 has a CRITICAL bug with Next.js 16 Turbopack. The @tailwindcss/postcss plugin's markUsedVariable() function throws `RangeError: Invalid code point 11025747` during build.

**Solution:** Pin to `~4.0.0` in package.json. The monorepo uses 4.0.7 successfully. Upgrade to 4.1.x blocked until Tailwind releases fix.

**Source:** [Tailwind CSS v4.1.18 + Next.js 16 Turbopack Build Failure](https://github.com/vercel/next.js/discussions/88443)

### Bun + Next.js 16 Compatibility

**Status:** Generally compatible, but known issues exist.

**Known Issues:**
- Bun 1.3.6 has missing dependencies causing TypeScript build errors with Next.js 16.1.2
- Bun v1.3.2 has segmentation faults on Linux with Next.js 16 builds
- Test dependencies under Bun before deploying (some edge cases differ from Node.js)

**Mitigation:** Use Bun 1.x with "bunVersion": "1.x" in vercel.json. Vercel manages minor version. Monitor [Bun GitHub issues](https://github.com/oven-sh/bun/issues) for Next.js 16 compatibility updates.

**Source:** [Latest version of Bun 1.3.6 is not working with latest Next.js version 16.1.2](https://github.com/oven-sh/bun/issues/26165)

### next-intl `use cache` Limitation

**Status:** next-intl v4.4+ supports Next.js 16, but `use cache` directive doesn't work seamlessly yet.

**Reason:** Awaiting `next/root-params` API from Next.js to access locale without relying on headers().

**Impact:** If using `use cache` in future phases, will need setRequestLocale() workarounds until next/root-params ships.

**Source:** [Implementing Next.js 16 'use cache' with next-intl](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/)

### Framer Motion in Server Components

**Limitation:** Framer Motion requires DOM access, so it ONLY works in client components.

**Pattern:** Wrap motion components in "use client" files, pass children from Server Components.

**Example:**
```typescript
// _components/animations/MotionDiv.tsx
"use client";
import { motion } from "framer-motion";
export const MotionDiv = motion.div;

// [locale]/page.tsx (Server Component)
import { MotionDiv } from "./_components/animations/MotionDiv";
export default function Page() {
	return <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</MotionDiv>;
}
```

**Source:** [How to use Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)

### Tailwind v4 CSS Limitations

**No @apply with theme variables:** Tailwind v4 CSS variables don't work with @apply directives. Use direct CSS with @theme declarations instead.

**Example:**
```css
/* ❌ Doesn't work in Tailwind v4 */
.custom-class {
	@apply bg-primary;
}

/* ✅ Works in Tailwind v4 */
@theme {
	--color-primary: oklch(0.7 0.2 270);
}
.custom-class {
	background-color: var(--color-primary);
}
```

**Source:** Monorepo gotcha from landing app experience.

### next/og CSS Support

**Satori Rendering Engine:** next/og uses Satori for JSX → PNG conversion.

**Supported:**
- Flexbox layout
- Basic typography (font-size, font-weight, color)
- Borders, shadows, gradients
- Absolute positioning

**NOT Supported:**
- CSS Grid
- calc()
- CSS variables (use inline values)
- transform / animations
- Advanced selectors

**Workaround:** Design OG images with Flexbox-only layouts. Inline all values.

**Source:** [Metadata Files: opengraph-image and twitter-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

## Monorepo Integration

### Shared Packages

**@404tf/database:**
- Drizzle schema with `pgSchema("404 Tech Found")`
- Neon connection setup
- Enum prefix: `spechack_` (not `landing_`)
- Table naming: Clear table names (e.g., `participants`, `ambassador_applications`)

**@404tf/config:**
- Biome configuration (tabs, double quotes, 100 char line width)
- Shared tsconfig.json base
- No shadcn/ui dependency (landing app uses native components)

### Environment Variables

| Variable | Scope | Required | Notes |
|----------|-------|----------|-------|
| `DATABASE_URL` | Server | Yes | Shared Neon Postgres connection string |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes | For absolute URLs in OG images |
| `NEXT_PUBLIC_PROJECT_NAME` | Public | No | Defaults to "SpecHack" |

### File Conventions

**Must-follow from monorepo:**
- `src/proxy.ts` for next-intl (same level as `app/`, NOT inside `app/`)
- No default exports except Next.js special files (page, layout, error, etc.)
- Named exports for all components
- Underscore prefix for private directories (`_components/`, `_actions/`)
- `.actions.ts` suffix for Server Actions
- `@/` path alias for imports (maps to `./src/`)

## Migration-Specific Patterns

### Vite/React SPA → Next.js 16

| Source Pattern | Next.js 16 Pattern | Notes |
|----------------|-------------------|-------|
| React Router | App Router `[locale]` dynamic segment | URL structure: `/es/c/[name]`, `/en/` |
| LanguageContext + i18n.ts | next-intl JSON messages | `messages/es.json`, `messages/en.json` |
| shadcn/ui Accordion | Custom Tailwind v4 component | Port directly, only component needed |
| Client form + console.log | Server Action + useActionState + Zod | Returns FormState object with errors |
| localStorage card data | Neon Postgres via Drizzle | Sequential agent numbers from DB |
| Static HTML | Dynamic metadata + OG images | `opengraph-image.tsx` file convention |
| Tailwind v3 HSL variables | Tailwind v4 @theme declarations | No HSL(), use oklch() or hex |
| Client-side routing | Server Components + client wrappers | Default to async Server Components |

### Translation Prop-Drilling Pattern

**From landing app:**
- Server Components call `getTranslations()` from next-intl
- Pass translated strings as props to client components
- No runtime dictionary lookups in client components
- Type-safe with TypeScript

**Example:**
```typescript
// [locale]/page.tsx (Server Component)
import { getTranslations } from "next-intl/server";
import { HeroSection } from "./_components/HeroSection";

export default async function Page() {
	const t = await getTranslations("hero");
	return <HeroSection title={t("title")} subtitle={t("subtitle")} />;
}

// _components/HeroSection.tsx (Client Component)
"use client";
type HeroSectionProps = {
	title: string;
	subtitle: string;
};
export function HeroSection({ title, subtitle }: HeroSectionProps) {
	return <motion.div>...</motion.div>;
}
```

## Stack Confidence Assessment

| Technology | Confidence | Source |
|------------|------------|--------|
| Next.js 16.1.6 | HIGH | Official docs, monorepo proven |
| React 19.2 | HIGH | Next.js 16 requirement, official release |
| next-intl 4.8.2 | HIGH | Verified in monorepo, official docs |
| Tailwind v4.0.x | HIGH | Verified in monorepo, bug documented |
| Drizzle ORM 0.45.1 | HIGH | Verified in monorepo, Neon official guides |
| Neon Postgres | HIGH | Verified in monorepo, serverless client 1.0.2 |
| Framer Motion 12.34.0 | HIGH | Verified in monorepo, React 19 compatible |
| Zod 4.3.6 | HIGH | Verified in monorepo, Server Actions standard |
| Bun 1.x | MEDIUM | Known Next.js 16.1.2 issues, monitor for updates |
| next/og | HIGH | Built into Next.js 16, official docs |
| Canvas API | HIGH | Browser standard, client-side only |

## Sources

### Official Documentation
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrading Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- [next-intl Documentation](https://github.com/amannn/next-intl)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon)
- [Next.js Metadata Files: OG Images](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Framer Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide)

### Critical Bug Reports
- [Tailwind CSS v4.1.18 + Next.js 16 Turbopack Build Failure](https://github.com/vercel/next.js/discussions/88443)
- [Bun 1.3.6 not working with Next.js 16.1.2](https://github.com/oven-sh/bun/issues/26165)
- [Next.js 16 build with Bun segmentation fault](https://github.com/oven-sh/bun/issues/24829)

### Best Practices & Patterns
- [How to use Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [Implementing Next.js 16 'use cache' with next-intl](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/)
- [Handling Forms in Next.js with Server Actions and Zod](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/)
- [Generate Dynamic OG Images with Next.js 16](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [Bun runtime on Vercel Functions](https://vercel.com/blog/bun-runtime-on-vercel-functions)

### Monorepo Verification
- Verified installed versions via `bun pm ls --all` in 404tf monorepo
- Landing app proven patterns for next-intl, Framer Motion, Drizzle, Zod, Tailwind v4
