# Phase 2: Static Content Migration - Research

**Researched:** 2026-02-08
**Domain:** Next.js Server Components, next-intl message files, static content migration from React SPA
**Confidence:** HIGH

## Summary

Phase 2 migrates 11 landing page sections from the existing Vite/React SPA to Next.js Server Components with bilingual support via next-intl. The core technical challenge is converting client-side components that use Framer Motion animations, React hooks (useState, useContext), and scroll interactions into pure Server Components that render static HTML with translations from `messages/es.json` and `messages/en.json`.

The standard approach is:
1. Extract all ~140 translation keys from `LanguageContext.tsx` and restructure into next-intl nested message files
2. Strip all client-side features (Framer Motion, onClick handlers, state management) from section components
3. Convert each section to async Server Component using `getTranslations` from `next-intl/server`
4. Preserve exact JSX structure, Tailwind classes, and responsive design from original SPA
5. Use Lucide React icons directly (they work in Server Components as pure SVG functions)

**Critical insight:** Server Components are the default in Next.js 15+. Components are Server Components UNLESS they use hooks, browser APIs, or have `'use client'` directive. Lucide icons work because they're pure functions returning SVG JSX—no hooks, no state, no DOM access.

**Primary recommendation:** Migrate content in two passes: (1) Translation files + page composition first to establish structure, then (2) All 7 sections at once to validate responsive design across the full page. Testing mobile responsiveness requires the complete landing page assembled, not isolated sections.

## Standard Stack

The established libraries for this migration pattern:

### Core (from Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6+ | React framework with Server Components | Default rendering model in App Router |
| next-intl | 4.8.2+ | i18n with Server Component support | Only i18n library with native `getTranslations` for RSC |
| tailwindcss | 4.0.7 | Utility-first CSS | Already configured in Phase 1 with cyberpunk theme |
| lucide-react | latest | Icon library (SVG components) | Tree-shakable, works in Server Components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/node | latest | TypeScript types for Node.js | Already installed, needed for async Server Components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | react-i18next | react-i18next requires client-side hooks, no Server Component support |
| lucide-react | react-icons | react-icons uses Context API, incompatible with Server Components |
| Server Components | Client Components ('use client') | Would ship unnecessary JavaScript, lose performance benefits |

**Installation:**
```bash
# No new packages needed - Phase 1 installed everything
# Verify lucide-react is available:
bun add lucide-react
```

## Architecture Patterns

### Pattern 1: Server Component with next-intl Translations

**What:** Async Server Component fetching translations via `getTranslations` from next-intl/server

**When to use:** Every section component in Phase 2 (Hero, Houses, Programs, Events, Community, Partners, Footer)

**Example:**
```typescript
// Source: https://next-intl.dev/docs/environments/server-client-components
// app/[locale]/_components/Hero.tsx
import { getTranslations } from 'next-intl/server';
import { Cpu } from 'lucide-react';

export async function Hero() {
  const t = await getTranslations('landing.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="font-orbitron text-6xl font-bold text-glow-purple">
          {t('headline')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}
```

**Key details:**
- Function MUST be async to await `getTranslations`
- Import from `next-intl/server` NOT `next-intl` (the latter is for Client Components)
- No `'use client'` directive - Server Component by default
- Lucide icons work directly: `<Cpu className="h-10 w-10" />`

### Pattern 2: Nested Message File Structure

**What:** Organize translation keys by section using dot notation in next-intl message files

**When to use:** Structuring the ~140 translation keys from LanguageContext into messages/es.json and messages/en.json

**Example:**
```json
// Source: https://next-intl.dev/docs/usage/translations
// messages/es.json
{
  "landing": {
    "hero": {
      "eyebrow": "PRE-INCUBADORA DEEP-TECH",
      "headline": "Construyendo las 404 startups deep-tech de LATAM",
      "subtitle": "Convertimos ciencia de frontera en empresas escalables.",
      "cta1": "Empieza aquí",
      "cta2": "Conoce más"
    },
    "houses": {
      "title": "Nuestras Casas",
      "subtitle": "Tres verticales donde la ciencia se convierte en startups.",
      "ai": {
        "tagline": "\"Code that thinks.\"",
        "desc": "Modelos de lenguaje, visión por computadora..."
      }
    }
  }
}
```

**Access nested keys:**
```typescript
const t = await getTranslations('landing.hero');
t('headline') // → "Construyendo las 404 startups deep-tech de LATAM"
t('cta1')     // → "Empieza aquí"
```

**Namespace best practices:**
- Use `landing.` prefix for all Phase 2 content
- Nest by section: `landing.hero`, `landing.houses`, `landing.programs`
- Keep depth to 3 levels max: `landing.houses.ai.desc`
- Mirror section component structure for predictability

### Pattern 3: Mobile-First Responsive with Tailwind

**What:** Tailwind's mobile-first breakpoint system where unprefixed utilities target mobile, prefixed target larger screens

**When to use:** All section components to ensure mobile-responsive design (requirement STATIC-10)

**Example:**
```tsx
// Source: https://tailwindcss.com/docs/responsive-design
<div className="
  grid
  grid-cols-1           /* Mobile: single column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-6
">
  <Card />
  <Card />
  <Card />
</div>
```

**Breakpoints (Tailwind v4 defaults):**
- Default (mobile): 0px - 767px
- `md:` (tablet): 768px+
- `lg:` (desktop): 1024px+

**Testing viewports (requirement STATIC-10):**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1440px width

### Pattern 4: Static Asset Handling in Server Components

**What:** Using Next.js Image component with static imports for optimized images

**When to use:** Mascot image (Hero section), partner logos (Partners section), footer logo

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
import Image from 'next/image';
import mascotImage from '@/assets/mascot.png';

export async function Hero() {
  return (
    <Image
      src={mascotImage}
      alt="Tardi, the 404 Tech Found mascot"
      width={384}  // w-96 = 384px
      height={384}
      priority     // Above fold, load immediately
      className="w-64 md:w-80 lg:w-96 drop-shadow-[0_0_30px_hsl(262_85%_50%/0.4)]"
    />
  );
}
```

**Key differences from original SPA:**
- Next.js 15 auto-installs `sharp` for optimization (no manual setup)
- Replace `<img src={mascot}>` with `<Image src={mascotImage}>`
- Specify width/height for layout shift prevention
- Use `priority` for above-fold images
- Keep original Tailwind classes for styling

### Pattern 5: Removing Client-Side Features

**What:** Systematic removal of client-only code (animations, interactions, state) from sections

**What to REMOVE in Phase 2:**

| Feature | Original Code | Phase 2 Replacement |
|---------|--------------|---------------------|
| Framer Motion animations | `<motion.div initial={{...}} animate={{...}}>` | `<div>` (remove motion wrapper) |
| Scroll interactions | `onClick={() => scrollTo('id')}` | `<a href="#id">` (native anchor) |
| Client hooks | `const { t } = useLanguage()` | `const t = await getTranslations()` |
| State management | `const [open, setOpen] = useState()` | Remove entirely (Phase 3) |
| Hover effects via JS | `onMouseEnter/Leave` | Pure CSS `:hover` in Tailwind |

**Example transformation:**
```tsx
// BEFORE (Vite/React SPA with Framer Motion)
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Houses() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2>{t("houses.title")}</h2>
    </motion.div>
  );
}

// AFTER (Next.js Server Component - Phase 2)
import { getTranslations } from 'next-intl/server';

export async function Houses() {
  const t = await getTranslations('landing.houses');

  return (
    <div>
      <h2>{t('title')}</h2>
    </div>
  );
}
```

**Critical:** Keep ALL Tailwind classes, structure, and semantic HTML. Only remove client-side JavaScript features.

### Anti-Patterns to Avoid

- **DON'T use `useTranslations` in async Server Components:** This is a hook. Use `getTranslations` instead.
- **DON'T add `'use client'` to section components:** These are purely presentational with no interactivity in Phase 2.
- **DON'T skip translation keys:** Even if text is "temporary" or placeholder, add it to message files. Hard-coded strings will leak into production.
- **DON'T change Tailwind classes arbitrarily:** The original SPA has validated responsive design. Preserve it exactly.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| i18n routing with locale prefixes | Custom middleware | `next-intl` routing config | Handles locale detection, redirects, alternate links, metadata |
| Image optimization | Custom image proxy | `next/image` | Automatic WebP/AVIF conversion, lazy loading, responsive sizes |
| Translation key splitting | Custom namespace logic | next-intl dot notation | Built-in nested message support with `getTranslations('namespace')` |
| SVG icon tree-shaking | Manual SVG imports | lucide-react direct imports | Already tree-shaken via ES modules |
| Mobile-first breakpoints | Custom CSS media queries | Tailwind responsive utilities | Consistent breakpoints, mobile-first by default |

**Key insight:** Phase 1 already configured the hard parts (next-intl routing, Tailwind v4 theme). Phase 2 is content migration, not infrastructure building.

## Common Pitfalls

### Pitfall 1: Using Client-Only Hooks in Server Components

**What goes wrong:**
```tsx
// ❌ ERROR: useTranslations is a hook
export async function Hero() {
  const t = useTranslations('landing.hero'); // TypeError: hooks not supported
  // ...
}
```

**Why it happens:** Developers copy patterns from react-i18next or client-side next-intl examples without checking Server Component compatibility.

**How to avoid:**
- ALWAYS use `getTranslations` from `next-intl/server` in async Server Components
- NEVER import hooks (`useTranslations`, `useLocale`) in Server Components
- Verify imports: `import { getTranslations } from 'next-intl/server'`

**Warning signs:**
- TypeScript error: "async function cannot use hooks"
- Runtime error: "useContext is not a function"

### Pitfall 2: Translation Key Mismatches Between Locales

**What goes wrong:** Spanish message file has `landing.hero.headline` but English has `landing.hero.title` → breaks on locale switch

**Why it happens:** Manually copying keys between `es.json` and `en.json` leads to typos, inconsistent nesting, or missed keys.

**How to avoid:**
- **Use identical structure:** Both `es.json` and `en.json` must have exact same keys
- **Validation script:** Compare keys before commit
- **Start from one source:** Copy `es.json` structure to `en.json`, then translate values only

**Warning signs:**
- Page renders in Spanish but shows key names (e.g., "landing.hero.headline") in English
- TypeScript error: Property 'headline' does not exist

### Pitfall 3: Breaking Mobile Responsiveness During Migration

**What goes wrong:** Original SPA has `className="flex flex-col lg:flex-row"` for mobile-first layout. Migration changes to `flex-row lg:flex-col` → mobile layout broken.

**Why it happens:** Not understanding Tailwind's mobile-first approach: unprefixed classes apply to ALL screen sizes, prefixed override at breakpoints.

**How to avoid:**
- **Copy Tailwind classes exactly** from original SPA components
- **Test on 375px viewport** FIRST (mobile-first = design for mobile, enhance for desktop)
- **Understand cascade:** `flex flex-col md:flex-row` means "column on mobile, row on tablet+"

**Warning signs:**
- Desktop looks good but mobile has horizontal scrolling
- Elements stacked on desktop but side-by-side on mobile (inverted layout)

### Pitfall 4: Image Optimization Props Missing

**What goes wrong:** Using `<Image src={mascot} alt="..." />` without `width` and `height` causes layout shift and hydration warnings.

**Why it happens:** Developers familiar with `<img>` tag don't realize Next.js Image requires dimensions for optimization.

**How to avoid:**
- **Always specify `width` and `height`** on Image components
- **Use `priority` for above-fold images** (Hero mascot, header logo)
- **Static imports provide dimensions automatically:** `import mascot from '@/assets/mascot.png'` → Next.js reads file metadata

**Warning signs:**
- Console warning: "Image with src '...' is missing required 'width' property"
- Layout shift visible on page load (image space not reserved)

### Pitfall 5: Namespace Confusion in Translation Access

**What goes wrong:**
```tsx
const t = await getTranslations('landing.hero');
t('landing.hero.headline') // ❌ WRONG - double nesting
```

Should be: `t('headline')` because namespace already set to `landing.hero`

**Why it happens:** Developers assume `getTranslations` is just a message loader, not understanding it sets the translation scope.

**How to avoid:**
- **Understand `getTranslations` as scope setter:** `getTranslations('landing.hero')` returns function scoped to that namespace
- **Use relative keys:** After scoping to `landing.hero`, use `t('headline')` NOT `t('landing.hero.headline')`
- **Match component to namespace:** Hero component → `getTranslations('landing.hero')`

**Warning signs:**
- Translation keys display as-is on page (e.g., "landing.hero.headline" instead of translated text)
- TypeScript error if strict typing enabled

### Pitfall 6: Forgetting Async/Await on getTranslations

**What goes wrong:**
```tsx
export async function Hero() {
  const t = getTranslations('landing.hero'); // ❌ Forgot await
  return <h1>{t('headline')}</h1>; // TypeError: t is not a function
}
```

**Why it happens:** `getTranslations` is async (loads messages from file system), but looks like a synchronous function call.

**How to avoid:**
- **ALWAYS await `getTranslations`:** `const t = await getTranslations(...)`
- **Component must be async:** `export async function Hero()` to use await
- **TypeScript helps:** Enable strict mode to catch missing await

**Warning signs:**
- Runtime error: "t is not a function" or "Cannot read property 'headline' of undefined"
- TypeScript error: "Type 'Promise<...>' is not callable"

## Code Examples

Verified patterns from official sources and original SPA:

### Complete Section Component Migration

```typescript
// Source: Original SPA (/home/hybridz/Projects/deep-tech-nexus/src/components/landing/Houses.tsx)
// Migrated to Next.js Server Component pattern

// app/[locale]/_components/Houses.tsx
import { getTranslations } from 'next-intl/server';
import { Cpu, Dna, Cog } from 'lucide-react';

export async function Houses() {
  const t = await getTranslations('landing.houses');

  const houses = [
    {
      key: 'ai',
      icon: Cpu,
      tagline: '"Code that thinks."',
      colorClass: 'text-house-ai border-house-ai/30',
      glowClass: 'glow-border-ai',
      bgClass: 'bg-house-ai/5',
    },
    {
      key: 'biotech',
      icon: Dna,
      tagline: '"Evolving life, engineering futures."',
      colorClass: 'text-house-biotech border-house-biotech/30',
      glowClass: 'glow-border-biotech',
      bgClass: 'bg-house-biotech/5',
    },
    {
      key: 'hardware',
      icon: Cog,
      tagline: '"Atoms to products."',
      colorClass: 'text-house-hardware border-house-hardware/30',
      glowClass: 'glow-border-hardware',
      bgClass: 'bg-house-hardware/5',
    },
  ];

  return (
    <section id="houses" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {houses.map((house) => {
            const Icon = house.icon;
            return (
              <div
                key={house.key}
                className={`rounded-xl border p-8 ${house.colorClass} ${house.glowClass} ${house.bgClass} hover:scale-[1.02] transition-transform`}
              >
                <Icon className="h-10 w-10 mb-4" />
                <p className="font-mono-accent text-sm mb-3 opacity-80">
                  {house.tagline}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`${house.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Changes from original:**
- ❌ Removed: `import { motion } from "framer-motion"`
- ❌ Removed: `import { useLanguage } from "@/contexts/LanguageContext"`
- ❌ Removed: All `<motion.div>` wrappers and animation props
- ✅ Added: `import { getTranslations } from 'next-intl/server'`
- ✅ Added: `async` keyword on function
- ✅ Changed: `const { t } = useLanguage()` → `const t = await getTranslations('landing.houses')`
- ✅ Changed: `t("houses.title")` → `t("title")` (namespace already scoped)
- ✅ Kept: ALL Tailwind classes, structure, Lucide icons, responsive grid

### Landing Page Composition

```typescript
// Source: Original SPA (/home/hybridz/Projects/deep-tech-nexus/src/pages/Index.tsx)
// app/[locale]/page.tsx

import { setRequestLocale } from 'next-intl/server';
import { Hero } from './_components/Hero';
import { Houses } from './_components/Houses';
import { Programs } from './_components/Programs';
import { Events } from './_components/Events';
import { Community } from './_components/Community';
import { Partners } from './_components/Partners';
import { Footer } from './_components/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <Houses />
      <Programs />
      <Events />
      <Community />
      <Partners />
      <Footer />
    </main>
  );
}
```

**Key details:**
- All sections are async Server Components
- `setRequestLocale` enables static rendering (from Phase 1)
- No `'use client'` anywhere - pure Server Components
- Section order matches original SPA

### Translation Message File Structure

```json
// messages/es.json
{
  "landing": {
    "hero": {
      "eyebrow": "PRE-INCUBADORA DEEP-TECH",
      "headline": "Construyendo las 404 startups deep-tech de LATAM",
      "subtitle": "Convertimos ciencia de frontera en empresas escalables. Creada por fundadores, para fundadores.",
      "cta1": "Empieza aquí",
      "cta2": "Conoce más"
    },
    "houses": {
      "title": "Nuestras Casas",
      "subtitle": "Tres verticales donde la ciencia se convierte en startups.",
      "ai": {
        "desc": "Modelos de lenguaje, visión por computadora, y agentes autónomos aplicados a problemas reales de LATAM."
      },
      "biotech": {
        "desc": "Biología sintética, diagnóstico molecular, y agricultura de precisión para un continente con biodiversidad única."
      },
      "hardware": {
        "desc": "Robótica, IoT industrial, y dispositivos médicos — del prototipo a la manufactura."
      }
    },
    "programs": {
      "title": "Programas",
      "subtitle": "Tu camino de la idea al producto.",
      "preincubation": {
        "badge": "ABIERTO",
        "duration": "12 semanas",
        "b1": "Mentoría 1-a-1",
        "b2": "Acceso a red de expertos",
        "b3": "Workshops técnicos y de negocio",
        "b4": "Demo Day ante inversores",
        "cta": "Aplica ahora"
      },
      "fellowship": {
        "badge": "PRÓXIMAMENTE",
        "duration": "6 meses",
        "b1": "Financiamiento sin equity",
        "b2": "Acceso a lab & workspace",
        "b3": "Presentaciones a inversores",
        "b4": "Red internacional",
        "cta": "Notifícame"
      }
    },
    "events": {
      "title": "Eventos",
      "subtitle": "Donde la comunidad deep-tech se encuentra.",
      "spechack": {
        "tagline": "\"El hackathon donde la spec es el producto.\"",
        "desc": "10 días. Escribe la especificación primero, construye con IA después. El antídoto contra el \"vibe coding\". Hubs presenciales + track virtual.",
        "register": "Regístrate",
        "ambassador": "Sé Embajador"
      }
    },
    "community": {
      "title": "Comunidad",
      "subtitle": "Conoce a quienes están construyendo el futuro.",
      "link": "Ver toda la comunidad →"
    },
    "partners": {
      "title": "Partners"
    },
    "footer": {
      "tagline": "Built by founders, for founders.",
      "email": "hola@404techfound.com",
      "location": "Lima, Perú 🇵🇪",
      "rights": "© 2025 404 Tech Found"
    }
  }
}
```

**Structure rules:**
- Top-level: `landing` namespace
- Second level: section name (`hero`, `houses`, `programs`)
- Third level: content keys (`title`, `subtitle`) or subsections (`ai`, `biotech`)
- Fourth level (max depth): nested content (`ai.desc`)

**Identical structure in `messages/en.json`** with translated values.

### Hero Section with Image Optimization

```typescript
// app/[locale]/_components/Hero.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import mascotImage from '@/assets/mascot.png';

export async function Hero() {
  const t = await getTranslations('landing.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid - pure CSS, no JS */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="font-mono-accent text-xs tracking-[0.3em] text-primary mb-6">
              {t('eyebrow')}
            </p>

            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-glow-purple">
              {t('headline')}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* Phase 2: Plain anchor links (no scroll JS) */}
              <a
                href="#intent-cta"
                className="gradient-purple text-primary-foreground font-semibold px-8 py-3.5 rounded-lg text-base hover:opacity-90 transition-opacity"
              >
                {t('cta1')}
              </a>
              <a
                href="#houses"
                className="border border-border text-foreground font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-muted transition-colors"
              >
                {t('cta2')}
              </a>
            </div>
          </div>

          {/* Mascot - static image (no floating animation in Phase 2) */}
          <div className="flex-shrink-0">
            <Image
              src={mascotImage}
              alt="Tardi, the 404 Tech Found mascot — a cyberpunk tardigrade in a lab coat"
              width={384}
              height={384}
              priority
              className="w-64 md:w-80 lg:w-96 drop-shadow-[0_0_30px_hsl(262_85%_50%/0.4)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Migration notes:**
- ❌ Removed: All `<motion.div>` wrappers with `initial`, `animate`, `transition` props
- ❌ Removed: `onClick={() => scrollTo('id')}` handlers → replaced with `href="#id"` anchors
- ✅ Changed: `<img src={mascot}>` → `<Image src={mascotImage} width={384} height={384} priority>`
- ✅ Kept: All Tailwind classes for gradient backgrounds, typography, responsive layout
- ✅ Kept: Exact HTML structure and semantic elements

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-i18next with useTranslation hook | next-intl with getTranslations for RSC | Next.js 13 App Router (2023) | Server Components can't use hooks - need async function API |
| Manual image optimization | Next.js Image with auto sharp | Next.js 15 (2024) | sharp auto-installed, no manual setup needed |
| Client-side i18n routing | next-intl middleware routing | next-intl v3 (2023) | Locale routing handled at middleware layer, not runtime |
| Tailwind v3 with tailwind.config.js | Tailwind v4 with @import and CSS variables | Tailwind v4.0 (2024) | Configuration moves to CSS, @theme directive replaces JS config |
| Context API for translations | Request-based translation loading | Next.js App Router (2023) | Translations loaded per-request in Server Components, not global context |

**Deprecated/outdated:**
- `useTranslations()` in Server Components: Use `getTranslations()` instead (Server Components can't use hooks)
- `next/legacy/image`: Use `next/image` (legacy component removed in Next.js 14)
- Tailwind JIT mode: Built-in default in v3+, no configuration needed
- manual `sharp` installation: Next.js 15 auto-installs for production builds

## Open Questions

Things that couldn't be fully resolved:

1. **Lucide React exact Server Component compatibility documentation**
   - What we know: Lucide icons are pure SVG functions, work in practice with RSC
   - What's unclear: No official docs explicitly state "Server Component compatible"
   - Recommendation: Use directly in Phase 2, they work because no hooks/state. If issues arise, wrap in minimal client component
   - Confidence: MEDIUM (works empirically, not officially documented)

2. **Optimal message file splitting strategy**
   - What we know: next-intl supports splitting by locale, section, or server/client
   - What's unclear: For ~140 keys in Phase 2, is single file or split by section better?
   - Recommendation: Single file per locale (`messages/es.json`, `messages/en.json`) for Phase 2. Split in Phase 6 if performance issues arise
   - Confidence: HIGH (140 keys is small, premature optimization to split)

3. **Image dimensions for partner logos**
   - What we know: Partner section in original SPA uses placeholder text, not actual logo images
   - What's unclear: What are actual partner logo file dimensions?
   - Recommendation: Use 200x80px placeholder dimensions, adjust when actual logos provided
   - Confidence: LOW (depends on real assets not available in original SPA)

## Sources

### Primary (HIGH confidence)
- [Next.js Server and Client Components Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Core RSC concepts
- [next-intl Server & Client Components](https://next-intl.dev/docs/environments/server-client-components) - getTranslations vs useTranslations
- [next-intl Rendering Translations](https://next-intl.dev/docs/usage/translations) - Nested message structure, dot notation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoint system
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image) - Image optimization, width/height requirements
- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react) - Icon usage, tree-shaking

### Secondary (MEDIUM confidence)
- [React Server Components vs Client Components 2026](https://medium.com/@123ajaybisht/react-server-components-vs-client-components-when-to-use-what-bcec46cacded) - When to use which pattern
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Design tokens, responsive patterns
- [Migrating from Create React App to Next.js](https://nextjs.org/docs/app/guides/migrating/from-create-react-app) - SPA to SSR migration patterns
- [How to use Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) - Why animations need 'use client'

### Tertiary (LOW confidence)
- [Split your translations in next-intl](https://dev.to/hpouyanmehr/split-your-translations-in-next-intl-in-a-nice-way-4jof) - Message file organization (community guide)
- [Lucide React SSR discussions](https://github.com/lucide-icons/lucide/issues/1576) - Community reports, no official stance

### Source Material (Original SPA)
- `/home/hybridz/Projects/deep-tech-nexus/src/contexts/LanguageContext.tsx` - All 140+ translation keys
- `/home/hybridz/Projects/deep-tech-nexus/src/components/landing/*.tsx` - Section component structure, Tailwind classes
- `/home/hybridz/Projects/deep-tech-nexus/src/pages/Index.tsx` - Page composition order

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-intl and Next.js Image are official, documented solutions
- Architecture patterns: HIGH - Server Component patterns verified via official Next.js docs
- Translation migration: HIGH - Direct extraction from existing LanguageContext file
- Responsive design: HIGH - Copying exact Tailwind classes from validated SPA
- Lucide compatibility: MEDIUM - Works empirically, lacks explicit Server Component docs in package

**Research date:** 2026-02-08
**Valid until:** ~60 days (Next.js stable, next-intl mature, low churn expected)

**Phase 2 ready for planning:** All technical approaches verified, no blockers identified.
