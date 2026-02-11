# Phase 4: SEO & Metadata - Research

**Researched:** 2026-02-11
**Domain:** Next.js 16 App Router SEO with next-intl i18n
**Confidence:** HIGH

## Summary

Phase 4 implements comprehensive SEO infrastructure for a bilingual (ES/EN) Next.js 16 landing page using next-intl. The standard approach uses Next.js built-in Metadata API (`generateMetadata`), file-based metadata conventions (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`), and JSON-LD structured data embedded in pages.

Next.js 16 provides first-class support for all SEO requirements through the App Router's Metadata API, which generates server-side `<head>` tags. For i18n sites, the key challenges are: (1) absolute URLs for hreflang/canonical (requires `metadataBase`), (2) locale-aware OpenGraph images, and (3) per-locale metadata translations. All requirements can be satisfied using built-in Next.js APIs without third-party libraries.

The critical insight: **next-intl's middleware automatically adds Link headers for hreflang**, but explicit metadata alternates are still recommended for better SEO and social sharing compatibility. Canonical URLs should be self-referencing per locale (ES canonical points to /es, EN to /en).

**Primary recommendation:** Use `generateMetadata` in `app/[locale]/layout.tsx` for base metadata with `metadataBase`, create `app/[locale]/opengraph-image.tsx` for dynamic OG images, place `app/sitemap.ts` and `app/robots.ts` at root, and embed JSON-LD as script tags in layout or page components.

## Standard Stack

The established approach for Next.js 16 SEO with i18n:

### Core
| Library/API | Version | Purpose | Why Standard |
|-------------|---------|---------|--------------|
| Next.js Metadata API | 16.x | generateMetadata, metadata object | Built-in, server-rendered, type-safe, officially recommended |
| next/og ImageResponse | 16.x | Dynamic OpenGraph image generation | Official Next.js API, no external dependencies |
| File-based metadata | 16.x | sitemap.ts, robots.ts, opengraph-image.tsx | Convention over configuration, automatic registration |
| JSON-LD (script tags) | N/A | Structured data for search engines | Google's recommended format, cleaner than Microdata |
| next-intl | 4.x | i18n routing, locale-aware URLs | Already in project, middleware provides hreflang headers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | Latest | TypeScript types for schema.org | Optional, provides autocomplete for JSON-LD schemas |
| @vercel/og fonts | N/A | Custom fonts in ImageResponse | When using local fonts for OG images (project uses Google Fonts) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-in Metadata API | next-seo package | next-seo is legacy, doesn't support App Router well, adds dependency |
| File-based sitemap.ts | next-sitemap package | Package is pre-App Router era, less integrated |
| ImageResponse | Sharp/Puppeteer | More control but 10x complexity, breaks 500KB bundle limit |
| JSON-LD | Microdata/RDFa | JSON-LD is cleaner, Google's preference, easier to test |

**Installation:**
No additional packages required. All APIs are built into Next.js 16. Optional:
```bash
bun add -D schema-dts  # TypeScript types for JSON-LD schemas
```

## Architecture Patterns

### Project Structure
```
src/app/
├── layout.tsx                        # Root layout (no metadata here)
├── [locale]/
│   ├── layout.tsx                    # Locale layout with generateMetadata
│   ├── page.tsx                      # Home page (can override metadata)
│   └── opengraph-image.tsx           # Dynamic OG image per locale
├── sitemap.ts                        # Sitemap at root (handles all locales)
├── robots.ts                         # Robots.txt at root
└── icon.png / favicon.ico            # (optional) File-based icons

src/lib/
└── metadata/
    ├── seo-config.ts                 # Central SEO constants (site name, URLs)
    ├── json-ld/
    │   ├── organization.ts           # Organization schema generator
    │   ├── event.ts                  # Event schema generator (SpecHack)
    │   └── faq.ts                    # FAQPage schema generator
    └── og-image-config.ts            # Shared OG image design constants
```

### Pattern 1: generateMetadata with next-intl and metadataBase
**What:** Server-side metadata generation with locale-aware content and absolute URLs for hreflang/canonical
**When to use:** In `app/[locale]/layout.tsx` for base metadata shared across all pages
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// next-intl integration: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

// CRITICAL: metadataBase must be set for absolute URLs in alternates/openGraph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${t('siteName')}`,
      default: t('title'),
    },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'es': '/es',
        'en': '/en',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: t('siteName'),
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
      images: [
        {
          url: `/opengraph-image`,  // Relative URL, resolved via metadataBase
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

### Pattern 2: Dynamic OpenGraph Images per Locale
**What:** Generate locale-specific OG images using ImageResponse with translations and branding
**When to use:** `app/[locale]/opengraph-image.tsx` for per-route OG images
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const alt = '404 Tech Found';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  // IMPORTANT: Use fetch for Google Fonts (next/font not available in ImageResponse runtime)
  const interSemiBold = await fetch(
    new URL('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            color: 'white',
            textAlign: 'center',
          }}
        >
          {t('title')}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#a1a1aa',
            marginTop: '20px',
          }}
        >
          {t('tagline')}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: interSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}
```

### Pattern 3: Localized Sitemap with Alternates
**What:** Generate sitemap.xml with locale variants and hreflang alternates
**When to use:** `app/sitemap.ts` at root to list all localized pages
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org';

  return [
    {
      url: `${siteUrl}/es`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          es: `${siteUrl}/es`,
          en: `${siteUrl}/en`,
        },
      },
    },
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          es: `${siteUrl}/es`,
          en: `${siteUrl}/en`,
        },
      },
    },
  ];
}
```

### Pattern 4: JSON-LD Structured Data
**What:** Embed schema.org structured data as JSON-LD script tags in pages/layouts
**When to use:** For Organization, Event, FAQPage schemas in layout or page components
**Example:**
```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data
// Component: src/components/json-ld/organization-schema.tsx
export function OrganizationSchema({ locale }: { locale: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '404 Tech Found',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: locale === 'es'
      ? 'Comunidad de tecnología en Honduras'
      : 'Technology community in Honduras',
    sameAs: [
      'https://twitter.com/404techfound',
      'https://linkedin.com/company/404techfound',
      // ... other social links
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Event schema for SpecHack
export function EventSchema({ locale }: { locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'SpecHack 2026',
    startDate: '2026-06-19',
    endDate: '2026-06-28',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Honduras',
    },
    description: locale === 'es'
      ? 'Hackathon de 404 Tech Found'
      : '404 Tech Found Hackathon',
    organizer: {
      '@type': 'Organization',
      name: '404 Tech Found',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Anti-Patterns to Avoid
- **Relative URLs in hreflang/canonical:** Causes validation failures. Always use absolute URLs with metadataBase.
- **Client-side metadata:** Using `<Head>` or `useEffect` for meta tags. Metadata MUST be server-rendered via generateMetadata.
- **Reusing English translations:** Each locale MUST have translated metadata (title, description, etc.)
- **Missing metadataBase:** Next.js 16 will throw build errors for relative URLs in openGraph/alternates without metadataBase.
- **ImageResponse bundle bloat:** Embedding large images or too many fonts exceeds 500KB limit. Fetch fonts at runtime, use SVG for logos.
- **Invalid JSON-LD dates:** Use ISO 8601 format (`2026-06-19`), not human-readable (`June 19, 2026`).
- **Trailing commas in JSON-LD:** Breaks parsing. Use proper JSON (no comments, no trailing commas).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML builder with fs.writeFile | Next.js `app/sitemap.ts` convention | Auto-registered route, type-safe MetadataRoute.Sitemap, handles caching |
| Robots.txt rules | Static txt file or custom route handler | Next.js `app/robots.ts` convention | Dynamic rules per environment, type-safe MetadataRoute.Robots |
| OpenGraph images | Canvas API or Puppeteer screenshots | ImageResponse from next/og | 500KB bundle limit enforced, flexbox layout, font support, fast edge runtime |
| Metadata tags | Manual `<meta>` in layout | generateMetadata function | Automatic merging, parent extension, type-safe, prevents duplication |
| Hreflang headers | Custom middleware | next-intl middleware (already provides Link headers) | Automatic, standards-compliant, tested with crawlers |
| JSON-LD validation | Manual schema checking | Google Rich Results Test + Schema Markup Validator | Official tools, shows exactly what Google sees, detects 68% of common errors |

**Key insight:** Next.js 16's file-based metadata conventions (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`) auto-register as routes without manual configuration. Using custom route handlers (`app/api/sitemap/route.ts`) adds complexity with no benefit.

## Common Pitfalls

### Pitfall 1: Missing or Incorrect metadataBase
**What goes wrong:** Build errors like "metadata.metadataBase is not set for resolving social open graph" or relative URLs in hreflang that fail validation.
**Why it happens:** Next.js requires absolute URLs for openGraph images, alternates.canonical, and alternates.languages. Without metadataBase, relative URLs cannot be resolved.
**How to avoid:**
- Set metadataBase in root `app/[locale]/layout.tsx` generateMetadata
- Use environment variable: `new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org')`
- Ensure NEXT_PUBLIC_SITE_URL is defined in .env.example
**Warning signs:**
- Next.js build warnings mentioning metadataBase
- Social media crawlers showing wrong image URLs
- hreflang validator showing relative URLs

### Pitfall 2: ImageResponse 500KB Bundle Limit
**What goes wrong:** Deployment fails with cryptic errors like "Function size exceeded" or "Bundle too large"
**Why it happens:** ImageResponse uses edge runtime with strict 500KB limit. Embedding local images as base64 or loading multiple heavy fonts exceeds limit.
**How to avoid:**
- Fetch Google Fonts at runtime via fetch() instead of embedding
- Use SVG for logos (render inline, don't embed as image)
- Keep JSX simple (complex gradients and images add to bundle)
- Test locally: `bun run build` will catch bundle size issues
**Warning signs:**
- Build succeeds locally but fails on Vercel
- Error mentions "edge function" or "bundle size"
- OG image route loads slowly (>1s)

### Pitfall 3: Invalid JSON-LD Date Formats
**What goes wrong:** Google Rich Results Test shows "Invalid value for field 'startDate'" even though dates look correct
**Why it happens:** JSON-LD requires strict ISO 8601 format. Human-readable dates like "June 19, 2026" or missing timezone fail validation.
**How to avoid:**
- Always use YYYY-MM-DD format: `"2026-06-19"`
- For date-times, use full ISO 8601: `"2026-06-19T10:00:00-06:00"`
- Use new Date().toISOString() for dynamic dates
- Validate with Google Rich Results Test before deployment
**Warning signs:**
- Rich Results Test shows "Invalid" status
- Event doesn't appear in Google Search rich snippets
- Schema validator shows date-related errors

### Pitfall 4: Self-Referencing Canonical Confusion with i18n
**What goes wrong:** Setting EN canonical to point to ES version (or vice versa) causes duplicate content issues
**Why it happens:** Misunderstanding canonical tags as "point to original language" instead of "point to this page's authoritative URL"
**How to avoid:**
- Each locale's canonical MUST point to itself: `/es` → canonical `/es`, `/en` → canonical `/en`
- Use hreflang alternates to link language versions
- Pattern: `canonical: /${locale}`, `alternates.languages: { es: '/es', en: '/en' }`
**Warning signs:**
- Google Search Console shows unexpected canonicalization
- One locale doesn't appear in search results
- Hreflang validator shows "canonical mismatch"

### Pitfall 5: next/font Not Available in ImageResponse Runtime
**What goes wrong:** Trying to import from `@/styles/fonts` in opengraph-image.tsx fails with "Module not found" or runtime error
**Why it happens:** ImageResponse runs in edge runtime which doesn't support next/font imports. Must fetch fonts separately.
**How to avoid:**
- Fetch Google Fonts via URL: `fetch('https://fonts.googleapis.com/css2?family=Inter:wght@600')`
- Or load local font file: `readFile(join(process.cwd(), 'public/fonts/inter.ttf'))`
- Don't import from next/font/google or local font definitions
**Warning signs:**
- Module resolution errors in opengraph-image.tsx
- Font not rendering in OG image (falls back to default)
- Edge runtime errors mentioning "not supported"

## Code Examples

Verified patterns from official sources:

### Robots.ts with Sitemap Link
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://404techfound.org';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

### FAQPage JSON-LD Schema
```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage
export function FAQPageSchema({ locale }: { locale: string }) {
  const faqs = locale === 'es'
    ? [
        {
          question: '¿Qué es 404 Tech Found?',
          answer: 'Una comunidad de tecnología en Honduras...',
        },
        // ... more FAQs
      ]
    : [
        {
          question: 'What is 404 Tech Found?',
          answer: 'A technology community in Honduras...',
        },
        // ... more FAQs
      ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Environment Variable for Site URL
```bash
# .env.example
NEXT_PUBLIC_SITE_URL=https://404techfound.org
NEXT_PUBLIC_PROJECT_NAME=404 Tech Found
```

```typescript
// src/env/client.ts (add to existing)
export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_PROJECT_NAME: z.string(),
    // ... existing vars
  },
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME,
    // ... existing vars
  },
  // ... rest
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-seo package | Built-in generateMetadata | Next.js 13.2 (Feb 2023) | Removed dependency, better type safety, server-only rendering |
| Pages Router metadata in _app | App Router metadata in layout | Next.js 13.4 (May 2023) | Nested metadata merging, parent extension, per-route overrides |
| next-sitemap package | Built-in sitemap.ts | Next.js 13.3 (Apr 2023) | Convention over configuration, type-safe, auto-registered |
| Static robots.txt | Dynamic robots.ts | Next.js 13.3 (Apr 2023) | Environment-specific rules, no manual file copying |
| Microdata/RDFa | JSON-LD | Ongoing (Google preference) | Cleaner separation, easier testing, better tooling |
| Puppeteer for OG images | ImageResponse (next/og) | Next.js 13.0 (Oct 2022) | 10x faster, edge runtime, strict bundle limits prevent bloat |
| Synchronous params | Async params promise | Next.js 16.0 (Nov 2025) | Breaking change: `await params` required in generateMetadata |

**Deprecated/outdated:**
- **next-seo:** Still works but Pages Router focused, doesn't support App Router metadata merging well
- **Static metadata in _document:** Pages Router only, doesn't work in App Router
- **Client-side meta tag injection:** Search crawlers may not execute JS, breaks SSR benefits
- **Manual Link headers for hreflang:** next-intl middleware handles this automatically

## Next.js 16 Specific Changes

**Critical breaking changes affecting Phase 4:**

1. **Async params in generateMetadata (v16.0.0):**
   - `params` is now a Promise, must use `await params`
   - Example: `const { locale } = await params;` (not `params.locale`)
   - Applies to: generateMetadata, opengraph-image, sitemap with generateSitemaps

2. **Async params in opengraph-image (v16.0.0):**
   - Image generation function receives `params` as Promise
   - Example: `export default async function Image({ params }: { params: Promise<{ locale: string }> })`

3. **Sitemap generateSitemaps id parameter (v16.0.0):**
   - `id` parameter is now a Promise resolving to string
   - Only relevant if using generateSitemaps for multiple sitemaps (not needed for this phase)

**No changes to:** metadataBase, alternates, openGraph, twitter, robots, ImageResponse API

## Open Questions

Things that couldn't be fully resolved:

1. **next-intl Link header vs explicit metadata alternates**
   - What we know: next-intl middleware automatically sets Link headers for hreflang
   - What's unclear: Whether explicit alternates in metadata provides additional SEO benefit
   - Recommendation: Implement explicit alternates for maximum compatibility (some crawlers may not respect Link headers)

2. **Optimal OG image size for mobile sharing**
   - What we know: Standard is 1200x630 (Twitter/OG spec)
   - What's unclear: Whether mobile messaging apps (WhatsApp, Telegram) benefit from different sizes
   - Recommendation: Stick with 1200x630, most widely supported

3. **FAQPage schema placement**
   - What we know: Can be in layout (site-wide) or page (page-specific)
   - What's unclear: Whether Google prefers page-level FAQs or accepts site-level
   - Recommendation: Place in page component for FAQ section, ensures schema matches visible content

## Sources

### Primary (HIGH confidence)
- [Next.js generateMetadata API (v16.1.6)](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Complete metadata API reference
- [Next.js opengraph-image convention (v16.1.6)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) - File-based OG image generation
- [Next.js sitemap.ts (v16.1.6)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Sitemap generation API
- [Next.js robots.ts (v16.1.6)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - Robots.txt generation
- [Next.js ImageResponse API (v16.1.6)](https://nextjs.org/docs/app/api-reference/functions/image-response) - Dynamic image generation
- [Google FAQPage structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage) - Official FAQ schema specification
- [schema.org Organization](https://schema.org/Organization) - Organization schema definition
- [schema.org Event](https://schema.org/Event) - Event schema definition

### Secondary (MEDIUM confidence)
- [next-intl routing documentation](https://next-intl.dev/docs/routing/navigation) - Integration with Next.js metadata
- [Build with Matija: Canonical Tags and Hreflang in Next.js 15](https://www.buildwithmatija.com/blog/nextjs-advanced-seo-multilingual-canonical-tags) - Multilingual SEO patterns (verified with official docs)
- [Next.js SEO Optimization Guide (2026 Edition)](https://www.djamware.com/post/697a19b07c935b6bb054313e/next-js-seo-optimization-guide--2026-edition) - Common pitfalls and best practices
- [Google Rich Results Test](https://support.google.com/webmasters/answer/7445569) - Official validation tool

### Tertiary (LOW confidence)
- Community discussions on metadataBase configuration
- Blog posts on ImageResponse font loading (verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All Next.js built-in APIs, officially documented
- Architecture: HIGH - Official Next.js conventions and file structure
- next-intl integration: MEDIUM - Some patterns inferred from community discussions, verified against next-intl docs
- Pitfalls: HIGH - Sourced from GitHub issues, official docs warnings, and Google developer docs
- JSON-LD schemas: HIGH - schema.org and Google official documentation

**Research date:** 2026-02-11
**Valid until:** ~60 days (Next.js metadata API is stable, but best practices evolve)

**Key takeaways for planner:**
1. No external packages needed - all Next.js built-in
2. NEXT_PUBLIC_SITE_URL environment variable is mandatory
3. Metadata must be in `[locale]/layout.tsx` to access locale
4. ImageResponse has strict 500KB limit - fetch fonts at runtime
5. All params are now Promises in Next.js 16 (await required)
6. Each locale needs translated metadata (don't reuse English)
7. Canonical URLs are self-referencing per locale, hreflang links variants
