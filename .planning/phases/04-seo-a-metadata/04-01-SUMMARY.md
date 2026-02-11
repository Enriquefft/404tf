---
phase: 04-seo-metadata
plan: 01
subsystem: seo
tags: [seo, metadata, json-ld, opengraph, twitter-cards, next-intl, i18n]
requires:
  - 03-03 # IntentCTA form with content for FAQ schema
  - 02-02 # Primary content sections for metadata descriptions
  - 01-02 # next-intl routing for locale-aware metadata
provides:
  - generateMetadata function with per-locale SEO tags
  - JSON-LD Organization schema with social links
  - JSON-LD Event schema for SpecHack (Jun 19-28, 2026)
  - JSON-LD FAQPage schema with 4 locale-aware Q&A pairs
  - Open Graph and Twitter Card metadata
  - Central SEO config module
affects:
  - 04-02 # OpenGraph image generation will use metadata config
  - 05-02 # llms.txt will reference structured data
tech-stack:
  added:
    - Next.js Metadata API (generateMetadata)
    - JSON-LD structured data (Organization, Event, FAQPage)
  patterns:
    - Per-locale metadata generation with next-intl/server
    - Self-referencing canonical URLs with hreflang alternates
    - Server Component JSON-LD schemas
    - Central SEO configuration module
key-files:
  created:
    - src/lib/metadata/seo-config.ts
    - src/lib/metadata/json-ld/organization.tsx
    - src/lib/metadata/json-ld/event.tsx
    - src/lib/metadata/json-ld/faq.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/env/client.ts
    - .env.example
    - messages/es.json
    - messages/en.json
decisions:
  - id: central-seo-config
    choice: Single seo-config.ts module for all SEO constants
    rationale: Single source of truth for SITE_URL, SITE_NAME, SOCIAL_LINKS avoids duplication and inconsistencies
    alternatives: [Inline constants, Multiple config files]
  - id: self-referencing-canonical
    choice: Each locale's canonical points to itself (ES→/es, EN→/en)
    rationale: Standard SEO practice - canonical shows authoritative URL for this language version, hreflang links alternates
    alternatives: [Point all canonicals to ES (primary language), Use x-default]
  - id: json-ld-in-page
    choice: Render JSON-LD schemas at top of page component (not layout)
    rationale: Schemas describe page-specific content (event, FAQ), placing in page ensures schema matches visible content
    alternatives: [Render in layout, Create separate metadata files]
  - id: async-faq-schema
    choice: Make FAQPageSchema async to fetch translations
    rationale: Server Component can be async, allows using getTranslations for locale-aware Q&A pairs
    alternatives: [Pass translations as props, Use static JSON]
metrics:
  duration: 4.3m
  commits: 3
  files-changed: 11
  lines-added: 177
  lines-removed: 3
  tasks: 3
completed: 2026-02-11
---

# Phase 04 Plan 01: SEO Configuration & Metadata Summary

**One-liner:** Per-locale SEO metadata with generateMetadata, JSON-LD structured data (Organization, Event, FAQPage), and Open Graph/Twitter Card tags

## What Was Built

Complete SEO foundation for the 404 Tech Found landing page with:

1. **Central SEO Configuration:** Created `src/lib/metadata/seo-config.ts` as single source of truth for SITE_URL, SITE_NAME, CONTACT_EMAIL, and SOCIAL_LINKS (Twitter, LinkedIn, Instagram, YouTube)

2. **Environment Variables:** Added NEXT_PUBLIC_SITE_URL to t3-env client schema with validation, updated .env.example and .env.local with site configuration

3. **Metadata Translations:** Added "metadata" namespace (title, description, ogImageAlt, tagline) and "faq" namespace (4 Q&A pairs) to both messages/es.json and messages/en.json

4. **generateMetadata Function:** Implemented in `src/app/[locale]/layout.tsx` with:
   - metadataBase for absolute URLs
   - Title template with site name
   - Per-locale descriptions from translations
   - Self-referencing canonical URLs (ES→/es, EN→/en)
   - Hreflang alternates for both locales
   - Open Graph metadata (title, description, url, siteName, locale, images)
   - Twitter Card metadata (summary_large_image)
   - Robots directives for search engine indexing

5. **JSON-LD Structured Data:**
   - **OrganizationSchema:** Organization type with name, url, logo, and sameAs social links array
   - **EventSchema:** Event type for SpecHack 2026 (Jun 19-28) with ISO 8601 dates, MixedEventAttendanceMode, location (Lima, Peru), and organizer reference
   - **FAQPageSchema:** Async Server Component with 4 locale-aware Question/Answer pairs from translations

6. **Page Integration:** Added all three JSON-LD schemas to `src/app/[locale]/page.tsx` at top of main element, ensuring structured data is visible to search engine crawlers

## Verification Results

Tested both `/es` and `/en` routes with dev server:

**Spanish (/es):**
- ✅ Title: "404 Tech Found — Pre-incubadora Deep-Tech LATAM"
- ✅ Description: Spanish pre-incubation program description
- ✅ Canonical: `https://404techfound.org/es`
- ✅ Hreflang alternates: es and en
- ✅ Open Graph: Spanish title, description, es_ES locale, OG image URL
- ✅ Twitter Card: summary_large_image with Spanish metadata
- ✅ JSON-LD Organization: name, url, logo, social links array
- ✅ JSON-LD Event: SpecHack 2026, startDate "2026-06-19", endDate "2026-06-28", Spanish description
- ✅ JSON-LD FAQPage: 4 Spanish Q&A pairs from translations

**English (/en):**
- ✅ Title: "404 Tech Found — LATAM Deep-Tech Pre-Incubator"
- ✅ Description: English pre-incubation program description
- ✅ Canonical: `https://404techfound.org/en`
- ✅ Hreflang alternates: es and en
- ✅ Open Graph: English title, description, en_US locale
- ✅ JSON-LD schemas present with locale-aware content

All success criteria from the plan are met:
- SEO-01: ✅ Per-locale titles, descriptions, canonical URLs, hreflang alternates
- SEO-02: ✅ Organization schema with social links
- SEO-03: ✅ Event schema with ISO 8601 dates
- SEO-04: ✅ FAQPage schema with 4 Q&A pairs
- SEO-08: ✅ Open Graph and Twitter Card tags present

## Task Commits

| Task | Description | Commit | Files Changed |
|------|-------------|--------|---------------|
| 1 | SEO config, env vars, metadata translations | d440950 | src/lib/metadata/seo-config.ts, src/env/client.ts, .env.example, messages/es.json, messages/en.json |
| 2 | generateMetadata with per-locale SEO tags | 0ae4de4 | src/app/[locale]/layout.tsx |
| 3 | JSON-LD structured data schemas | 3426733 | src/lib/metadata/json-ld/organization.tsx, src/lib/metadata/json-ld/event.tsx, src/lib/metadata/json-ld/faq.tsx, src/app/[locale]/page.tsx, src/lib/metadata/seo-config.ts |

## Decisions Made

### Central SEO Configuration Module
**Decision:** Create single `seo-config.ts` module exporting all SEO constants

**Rationale:** Having SITE_URL, SITE_NAME, SOCIAL_LINKS in one place ensures consistency across metadata generation, JSON-LD schemas, and future OpenGraph images. Avoids magic strings scattered across codebase.

**Impact:** Any SEO-related feature (OpenGraph images in 04-02, llms.txt in 05-02) imports from this single source of truth

### Self-Referencing Canonical URLs
**Decision:** Each locale's canonical URL points to itself (ES canonical → /es, EN canonical → /en)

**Rationale:** This is the standard SEO practice for multilingual sites. The canonical tag indicates the authoritative URL for *this* language version. Hreflang alternates link the language variants. Pointing all canonicals to ES would signal that ES is the only authoritative version, harming EN indexing.

**Reference:** Per research doc, "Pitfall 4: Self-Referencing Canonical Confusion with i18n" - confirmed this is the correct approach

### JSON-LD in Page Component
**Decision:** Render JSON-LD schemas at top of page.tsx main element, not in layout

**Rationale:** Schemas describe page-specific content (SpecHack event, FAQ section visible on page). Placing in page component ensures schema markup matches visible content, which Google prefers. Layout would work but less semantically accurate.

**Pattern:** Each schema is a Server Component, FAQPageSchema is async to fetch translations via getTranslations

### Async FAQPageSchema Component
**Decision:** Make FAQPageSchema an async Server Component

**Rationale:** Allows using `await getTranslations()` to fetch locale-aware Q&A pairs. Server Components can be async, so this is the simplest pattern. Alternative of passing translations as props would require fetching in page.tsx and threading through.

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blocks:** None - all dependencies satisfied

**Enables:**
- **04-02 (OpenGraph images):** Can import SITE_URL, SITE_NAME from seo-config for dynamic image generation
- **05-02 (llms.txt):** Can reference Organization schema and metadata translations for AI crawler content

**Concerns:** None - Next.js 16 Metadata API working as expected, next-intl integration smooth

## Technical Notes

### Next.js 16 Async Params Pattern
All param access uses `const { locale } = await params` pattern. Next.js 16 made params a Promise in generateMetadata, opengraph-image, and page components. This was handled correctly per research doc.

### Biome JSON-LD Linting
Added `biome-ignore` comments for `dangerouslySetInnerHTML` in JSON-LD components - this is required by the JSON-LD spec and not a security risk (we control the JSON content).

### metadataBase Requirement
Setting `metadataBase: new URL(SITE_URL)` in generateMetadata is mandatory for Next.js to resolve relative URLs in openGraph images and alternates. Without this, build would fail with "metadata.metadataBase is not set" error.

### Schema.org Compliance
All JSON-LD schemas follow schema.org spec:
- Organization: name, url, logo, sameAs (social profiles array)
- Event: name, startDate/endDate (ISO 8601), eventAttendanceMode (schema.org URL), location (Place with address), organizer (Organization reference)
- FAQPage: mainEntity array of Question/Answer pairs

Validated structure against schema.org documentation. Ready for Google Rich Results Test in next phase.

## Self-Check: PASSED

All created files exist:
- ✅ src/lib/metadata/seo-config.ts
- ✅ src/lib/metadata/json-ld/organization.tsx
- ✅ src/lib/metadata/json-ld/event.tsx
- ✅ src/lib/metadata/json-ld/faq.tsx

All commits exist:
- ✅ d440950 (Task 1: SEO config)
- ✅ 0ae4de4 (Task 2: generateMetadata)
- ✅ 3426733 (Task 3: JSON-LD schemas)

Verification completed: All files created, all commits present in git log.
