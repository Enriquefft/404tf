# Stack Research

**Domain:** Next.js 16 SEO/GEO-optimized landing page
**Researched:** 2026-02-08
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.1.6+ | React framework with App Router, SSR | Industry-standard for SEO-optimized React apps. Next.js 16 brings 2-5x faster builds with stable Turbopack, cache components with "use cache" directive, and React 19.2 support. App Router is required for optimal SEO with automatic metadata management. |
| **Bun** | 1.3.8+ | JavaScript runtime & package manager | Up to 25x faster package installation than npm. Drop-in Node.js replacement with dramatically reduced startup times. Production-ready as of 1.3.x, with 2.0 planned late 2026. |
| **React** | 19.2+ | UI library | Required by Next.js 16. Version 19.2 adds View Transitions, useEffectEvent(), and improved Server Components. |
| **TypeScript** | 5.1.0+ | Type safety | Required minimum version for Next.js 16. Enables full type safety across the stack with Drizzle ORM, TanStack Forms, and @t3-oss/env-nextjs. |

### Styling & UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tailwind CSS** | 4.0+ | Utility-first CSS framework | v4.0 (stable Jan 2025) brings 3.78x faster builds, zero-config setup, CSS-first configuration via @theme, and modern web platform features (cascade layers, oklch colors, @starting-style). Note: Use "global.css" naming (singular) for Next.js App Router compatibility. |
| **shadcn/ui** | latest | Component library (RSC-compatible) | Pre-built accessible components with full React Server Component support. Compatible with Tailwind v4 and Next.js 16. Copy-paste philosophy means no runtime dependency overhead. |
| **Framer Motion** | 12.33.0+ | Animation library | React 19 compatibility added in 12.x series. Industry-standard for declarative animations matching your cyberpunk theme requirements. |

### Internationalization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **next-intl** | 4.8.2+ | Next.js i18n | Native Next.js 16 support. Provides type-safe translations, automatic locale detection, and SEO-optimized routing. Note: Requires workaround for "use cache" directive (reads from headers() internally). Next.js root-params API will resolve this in future release. |

### Database & ORM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Drizzle ORM** | latest | TypeScript ORM | Serverless-ready by design, works in every runtime (Node, Bun, Edge). Type-safe schema with minimal overhead. Native Neon integration via @neondatabase/serverless driver. |
| **Neon** | latest (serverless) | Serverless Postgres | Serverless-native with HTTP/WebSocket drivers for Edge runtime. Auto-scaling, instant branching, zero cold-start latency. Perfect for landing page with minimal DB usage (intent form only). |
| **@neondatabase/serverless** | latest | Neon HTTP driver | Enables Postgres access from serverless/edge environments over HTTP instead of TCP. Required for Next.js Edge Runtime compatibility. |

### Forms & Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **TanStack Form** | 1.28.0+ | Headless form library | Type-safe, performant form state management with nested state support. Framework-agnostic design. Better DX than React Hook Form for complex validation. Actively maintained with regular updates in 2026. |
| **Zod** | latest | Schema validation | De facto standard for TypeScript validation. Integrates with TanStack Form and @t3-oss/env-nextjs for consistent validation patterns. |

### Environment & Configuration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@t3-oss/env-nextjs** | 0.13.10+ | Type-safe environment variables | Enforces validation across all Next.js runtimes (Node, Edge, client). Zero-runtime overhead. Prevents deployment with invalid env vars. Works seamlessly with Zod. |

### Development Tools

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Biome** | 2.3+ | Linter & formatter | 97% Prettier-compatible, 56x faster than ESLint (0.8s vs 45.2s for 10K files). Single dependency replacing ESLint + Prettier. Type-aware linting without TypeScript compiler. v2.3+ includes 434 rules. |
| **Knip** | latest | Dead code detection | Finds unused exports, dependencies, and files. Native Next.js support. Essential for maintaining clean codebase during rapid development. |
| **Lefthook** | 2.1.0+ | Git hooks manager | Fast, parallel hook execution written in Go. Single binary, zero dependencies. Native commitlint integration examples. |
| **commitlint** | latest | Commit message linting | Industry-standard for enforcing conventional commits. Pairs with Lefthook in commit-msg hook. |

### Analytics & Monitoring

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **PostHog** | latest | Product analytics | Native Next.js App Router integration via PostHogProvider. Supports React Server Components. Includes analytics, feature flags, session recordings. 2026-01-30+ config defaults fix React hydration issues. |

## Installation

```bash
# Core framework
bun add next@latest react@latest react-dom@latest

# Styling & UI
bun add tailwindcss@latest @tailwindcss/postcss
bun add framer-motion@latest
# shadcn/ui installed via CLI: bunx shadcn@latest init

# Internationalization
bun add next-intl@latest

# Database & ORM
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit

# Forms & validation
bun add @tanstack/react-form zod

# Environment & config
bun add @t3-oss/env-nextjs

# Analytics
bun add posthog-js

# Dev dependencies
bun add -D typescript @types/node @types/react @types/react-dom
bun add -D @biomejs/biome
bun add -D knip
bun add -D lefthook @commitlint/cli @commitlint/config-conventional
```

## Version Compatibility Matrix

| Package | Compatible With | Confidence | Notes |
|---------|-----------------|------------|-------|
| Next.js 16.1.6+ | React 19.2, Node 20.9+, Bun 1.3+ | HIGH | Requires TypeScript 5.1+. Chrome 111+, Safari 16.4+ |
| Tailwind v4.0+ | Next.js 16, PostCSS | HIGH | Use "global.css" naming (singular). Turbopack issue in v4.1.18 (use 4.0.7 if needed) |
| next-intl 4.8.2+ | Next.js 16 | HIGH | "use cache" requires workaround until next/root-params available |
| Framer Motion 12.33.0+ | React 19 | HIGH | React 19 test suite added to CI in 12.x series |
| shadcn/ui | Tailwind v4, React 19, Next.js 16 | HIGH | Full RSC support, January 2026 updates confirm compatibility |
| TanStack Form 1.28.0+ | React 19, Next.js 16 | HIGH | Framework-agnostic, works in any React version |
| Drizzle ORM | Bun, Node, Edge runtime | HIGH | Serverless-ready by design |
| Biome 2.3+ | Next.js, TypeScript, Bun | HIGH | Native TypeScript support, works with all runtimes |
| PostHog | Next.js 16 App Router, React 19 | HIGH | Use 2026-01-30+ config to avoid hydration issues |
| @t3-oss/env-nextjs 0.13.10+ | Next.js 16, Zod | MEDIUM | No explicit Next.js 16 docs yet, but pre-configured for all Next.js runtimes |

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| **Framework** | Next.js 16 | Remix, Astro | Remix for complex nested routing. Astro for content-heavy static sites. Next.js wins for SEO + dynamic features. |
| **Package Manager** | Bun | pnpm, npm | pnpm if Bun compatibility issues arise. Bun 25x faster and production-ready. |
| **CSS** | Tailwind v4 | CSS Modules, Styled Components | CSS Modules for zero-runtime. Tailwind v4 faster than v3, better DX with @theme. |
| **Forms** | TanStack Form | React Hook Form, Conform | React Hook Form for simpler forms. TanStack Form better for nested state + type safety. |
| **Linter/Formatter** | Biome | ESLint + Prettier | ESLint if you need specific plugins not in Biome. Biome 56x faster, single tool. |
| **ORM** | Drizzle | Prisma, Kysely | Prisma for more mature ecosystem + migrations. Drizzle lighter, serverless-first. |
| **Analytics** | PostHog | Vercel Analytics, Plausible | Vercel Analytics if staying in Vercel ecosystem. PostHog more features (flags, recordings). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Next.js Pages Router** | Deprecated pattern. App Router required for modern SEO features, automatic metadata, React Server Components. | Next.js App Router |
| **Tailwind v3** | v4.0 is 3.78x faster with zero-config setup. Breaking changes make mixed usage problematic. | Tailwind v4.0+ |
| **Node.js < 20.9** | Not supported by Next.js 16. Missing modern features. | Node.js 20.9+ or Bun 1.3+ |
| **React 18** | Next.js 16 requires React 19.2 for full feature support (View Transitions, cache components). | React 19.2+ |
| **ESLint + Prettier** | Biome replaces both with 56x faster performance and single config. Maintaining two tools adds complexity. | Biome 2.3+ |
| **Husky** | Slower than Lefthook (Node vs Go). More dependencies. | Lefthook 2.1.0+ |
| **middleware.ts** | Renamed to proxy.ts in Next.js 16. Edge runtime NOT supported in proxy (Node.js only). | proxy.ts with Node.js runtime |

## Stack Patterns by Use Case

**For SEO-optimized landing pages (your use case):**
- Use App Router with generateMetadata API for dynamic meta tags
- Enable Turbopack for 2-5x faster builds
- Use "use cache" directive for static sections (hero, features)
- Implement next-intl for bilingual ES/EN with locale detection
- PostHog for analytics without impacting Core Web Vitals
- Minimal database (Neon serverless for intent form only)

**For GEO-specific content:**
- Implement proxy.ts (not middleware.ts) with Node.js runtime
- Use Vercel Edge Config or request headers for geolocation
- Note: Next.js 16 proxy does NOT support Edge runtime (Node.js only)
- Alternative: Handle geo-targeting in React Server Components via request headers

**For optimal SEO:**
- Use Server Components by default (Next.js App Router default)
- Implement JSON-LD structured data for rich snippets
- Use Next.js Image component with priority for hero images
- Enable PPR (Partial Pre-Rendering) for static/dynamic hybrid
- Monitor Core Web Vitals: INP replaced FID in 2026

## Known Limitations & Workarounds

### Tailwind v4.1.18 + Turbopack
**Issue:** Build failures with Tailwind v4.1.18 on Next.js 16 Turbopack
**Workaround:** Downgrade to Tailwind v4.0.7 or wait for patch
**Source:** [GitHub Discussion #19556](https://github.com/tailwindlabs/tailwindcss/discussions/19556)

### next-intl + "use cache"
**Issue:** getTranslations() reads from headers(), incompatible with cached components
**Workaround:** Avoid "use cache" in components using getTranslations() until Next.js ships root-params API
**Source:** [Aurora Scharff blog post](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/)

### Middleware renamed to Proxy
**Issue:** Next.js 16 renamed middleware.ts to proxy.ts. Edge runtime NOT supported.
**Workaround:** Use proxy.ts with Node.js runtime (default). For geo-targeting, use request headers in Server Components.
**Source:** [Next.js 16 Blog](https://nextjs.org/blog/next-16)

### CSS File Naming
**Issue:** Tailwind v4 stricter about file naming with Next.js App Router
**Workaround:** Use `global.css` (singular) not `globals.css` (plural)
**Source:** [Medium article by Bale](https://medium.com/@bloodturtle/the-problem-f71da1eb9faa)

## SEO-Specific Recommendations

### Metadata Strategy
```tsx
// app/layout.tsx or page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: 'Your Title',
    description: 'Your Description',
    openGraph: {
      title: 'OG Title',
      description: 'OG Description',
      images: [{ url: '/og-image.png' }],
    },
    alternates: {
      canonical: 'https://yourdomain.com',
      languages: {
        'es': 'https://yourdomain.com/es',
        'en': 'https://yourdomain.com/en',
      },
    },
  };
}
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/hero.webp"
  alt="Hero image"
  width={1920}
  height={1080}
  priority // For above-fold images
  placeholder="blur" // Improve perceived performance
/>
```

### Structured Data (JSON-LD)
```tsx
export default function RootLayout() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '404 Tech Found',
    description: 'Deeptech incubator',
    url: 'https://404techfound.com',
  };

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Core Web Vitals Tips
- Use `priority` prop on hero images (LCP)
- Implement code splitting via dynamic imports for heavy components
- Use `useTransition` to prevent UI freezes (INP - replaced FID in 2026)
- Monitor with PostHog or Vercel Analytics
- Enable AVIF support in Next.js config for 20% better compression

## Gap Analysis

### Potential Missing Pieces

**1. Email Service (for intent form submissions)**
- **Gap:** No email service selected for form notifications
- **Options:** Resend, SendGrid, AWS SES
- **Recommendation:** Resend (Next.js-native, great DX, generous free tier)

**2. Content Management**
- **Current:** All content/design exists (no CMS needed for MVP)
- **Future consideration:** If content needs frequent updates, consider Sanity or Contentful

**3. Error Monitoring**
- **Gap:** No error tracking beyond PostHog
- **Options:** Sentry, Highlight
- **Recommendation:** PostHog's session recordings may suffice for MVP. Add Sentry if deep error tracking needed.

**4. Image Hosting/CDN**
- **Current:** Next.js Image Optimization via Vercel
- **Note:** Sufficient for landing page. If hosting elsewhere, consider Cloudinary or ImageKit.

**5. Rate Limiting (for intent form)**
- **Gap:** No rate limiting library
- **Options:** @upstash/ratelimit (serverless-native), express-rate-limit
- **Recommendation:** @upstash/ratelimit with Upstash Redis (serverless, edge-compatible)

**6. Testing**
- **Current:** No testing framework selected
- **Options:** Vitest (fastest), Jest, Playwright (E2E)
- **Recommendation:** Defer to Phase 2. Bun includes built-in test runner if needed.

## Sources

### Official Documentation (HIGH Confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Features, performance benchmarks, React compatibility
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) - Release details, breaking changes, modern features
- [Biome 2026 Roadmap](https://biomejs.dev/blog/roadmap-2026/) - Current version, features, future plans
- [Next.js Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Migration requirements
- [TanStack Form Docs](https://tanstack.com/form/latest) - API reference, framework support

### Package Registries (HIGH Confidence)
- [next-intl npm](https://www.npmjs.com/package/next-intl) - Version 4.8.2 (verified 2026-02-08)
- [TanStack Form npm](https://www.npmjs.com/package/@tanstack/react-form) - Version 1.28.0
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) - Version 12.33.0
- [Lefthook npm](https://www.npmjs.com/package/lefthook) - Version 2.1.0
- [@t3-oss/env-nextjs npm](https://www.npmjs.com/package/@t3-oss/env-nextjs) - Version 0.13.10

### GitHub Releases (HIGH Confidence)
- [Next.js Releases](https://github.com/vercel/next.js/releases) - 16.1.6 LTS (January 2026)
- [Bun Releases](https://github.com/oven-sh/bun/releases) - Version 1.3.8
- [Biome Releases](https://github.com/biomejs/biome) - Version 2.3+ (January 2026)

### Integration Guides (MEDIUM Confidence)
- [PostHog Next.js App Router Docs](https://posthog.com/docs/libraries/next-js) - Setup instructions, provider patterns
- [Drizzle + Neon Guide](https://orm.drizzle.team/docs/get-started/neon-new) - Driver setup, serverless patterns
- [shadcn/ui Next.js 15+ Docs](https://ui.shadcn.com/docs/react-19) - React 19 compatibility (extrapolates to Next.js 16)

### Community Discussions (MEDIUM Confidence)
- [Tailwind Turbopack Issue](https://github.com/tailwindlabs/tailwindcss/discussions/19556) - Known bug in v4.1.18
- [next-intl "use cache" workaround](https://aurorascharff.no/posts/implementing-nextjs-16-use-cache-with-next-intl-internationalization/) - Practical solution
- [Next.js 16 SEO Guide 2026](https://www.djamware.com/post/697a19b07c935b6bb054313e/next-js-seo-optimization-guide--2026-edition) - Best practices

---
*Stack research for: 404 Tech Found landing page*
*Researched: 2026-02-08*
*Confidence: HIGH (all major packages verified via official sources)*
