# Phase 2: Static Content Migration - Research

**Researched:** 2026-02-13
**Domain:** Next.js 16 Server Components, i18n content migration, responsive UI patterns
**Confidence:** HIGH

## Summary

Phase 2 migrates static landing sections from a Vite SPA prototype to Next.js 16 Server Components with bilingual (ES/EN) content. The standard approach is server-first rendering with strategic client boundaries for interactive elements (navbar mobile menu, language switcher, FAQ accordions). Content is delivered through next-intl's translation prop-drilling pattern: server components call `getTranslations()` and pass translated strings as props to client components, avoiding runtime dictionary lookups.

Key architectural pattern: Most landing sections are pure Server Components (Hero text, Manifesto, Judging, Sponsors, Footer). Only interactive UI requires client boundaries (Navbar for hamburger menu + scroll detection, FAQ for accordion state). Forms in Phase 2 are non-functional UI skeletons (registration form, ambassador form) - backend implementation happens in Phase 4.

**Primary recommendation:** Build seven section components as Server Components with translation prop-drilling. Create three client components (Navbar with scroll hooks, FAQ accordion). Use native `<details>` elements or controlled state for accordions. Leverage established patterns from landing app (Navbar scroll behavior, language switcher, mobile menu). Forms are presentational-only placeholders for Phase 4.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^3.x | Bilingual content management | Official Next.js i18n solution, server-first architecture |
| Framer Motion | ^11.x | Scroll animations (Phase 3) | Industry standard for React animations, established in Phase 1 |
| clsx | ^2.x | Conditional className utility | Lightweight, composable, used in landing app |
| hamburger-react | ^2.5.x | Mobile menu icon | Accessible, animated, used in landing app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | ^3.x | Form validation (Phase 4) | Server Action validation, type-safe schemas |
| React | ^19.x | UI framework | Stable features (useActionState, startTransition) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | react-i18next | next-intl is server-first, react-i18next requires client runtime |
| Native `<details>` | Custom accordion | Native is accessible, no JS required, but less animation control |
| clsx | classnames | clsx is smaller (228B vs 718B), same API |

**Installation:**
Already installed in Phase 1. No additional dependencies required.

## Architecture Patterns

### Recommended Project Structure
```
src/app/[locale]/
├── _components/
│   ├── animations/         # Phase 1 motion wrappers
│   ├── Navbar.tsx          # Client (scroll hooks, mobile state)
│   ├── Hero.tsx            # Server (static text + form placeholder)
│   ├── Manifesto.tsx       # Server (static text + phase cards)
│   ├── Judging.tsx         # Server (static text + criteria list)
│   ├── Hubs.tsx            # Server (static text + form placeholder)
│   ├── Sponsors.tsx        # Server (static text + CTAs)
│   ├── FAQ.tsx             # Client (accordion state) or Server (native details)
│   └── Footer.tsx          # Server (static links)
├── _actions/               # Phase 4 (not created in Phase 2)
└── page.tsx                # Server (composition root)
```

### Pattern 1: Server Component with Translation Prop-Drilling
**What:** Server component calls `getTranslations()`, renders content directly or passes translations to client components as props
**When to use:** All static content sections (Hero, Manifesto, Judging, Hubs, Sponsors, Footer)
**Example:**
```typescript
// Source: Project CLAUDE.md + next-intl docs
// apps/spechack/src/app/[locale]/_components/Hero.tsx

import { getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="min-h-screen">
      <h1>{t("headline")}</h1>
      <p>{t("subheadline")}</p>
      <time>{t("eventDate")}</time>
      {/* Form placeholder - non-functional until Phase 4 */}
      <form>
        <input name="name" placeholder={t("form.namePlaceholder")} />
        <input name="email" placeholder={t("form.emailPlaceholder")} />
        <button type="button">{t("form.submit")}</button>
      </form>
    </section>
  );
}
```

### Pattern 2: Client Component with Translation Props
**What:** Server component fetches translations, passes them as props to client component
**When to use:** Interactive UI that needs translations (Navbar, mobile menu)
**Example:**
```typescript
// Source: apps/landing/src/app/[locale]/_components/Navbar.tsx
// Server parent component
import { getTranslations } from "next-intl/server";
import { Navbar } from "./_components/Navbar";

export default async function Layout({ children, params }) {
  const { locale } = await params;
  const t = await getTranslations("navbar");

  return (
    <>
      <Navbar
        locale={locale}
        translations={{
          hero: t("hero"),
          manifesto: t("manifesto"),
          judging: t("judging"),
          // ...
        }}
      />
      {children}
    </>
  );
}
```

```typescript
// Client component
"use client";

type NavbarProps = {
  locale: "es" | "en";
  translations: {
    hero: string;
    manifesto: string;
    // ...
  };
};

export function Navbar({ locale, translations }: NavbarProps) {
  // Use translations prop, not runtime getTranslations()
  return <nav>{/* ... */}</nav>;
}
```

### Pattern 3: Scroll-Aware Navbar
**What:** Fixed navbar with backdrop blur, scroll direction detection for hide/show, scroll-based background opacity
**When to use:** Sticky navigation header
**Example:**
```typescript
// Source: apps/landing/src/hooks/useScrollDirection.ts
"use client";

import { useEffect, useState } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      // Only update if scroll delta > 10px to avoid jitter
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}
```

```typescript
// Navbar component usage
"use client";

export function Navbar({ locale, translations }: NavbarProps) {
  const scrollDirection = useScrollDirection();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      style={{
        transform: scrollDirection === "down" ? "translateY(-100%)" : "translateY(0)",
      }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl transition-all duration-300"
    >
      {/* ... */}
    </nav>
  );
}
```

### Pattern 4: Accordion Component (Two Approaches)

#### Approach A: Native `<details>` (Simpler, No JS Required)
```typescript
// Server Component - no client boundary needed
export async function FAQ() {
  const t = await getTranslations("faq");

  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];

  return (
    <section>
      {items.map((item, i) => (
        <details key={i} className="border-b">
          <summary className="cursor-pointer py-4">{item.q}</summary>
          <p className="pb-4">{item.a}</p>
        </details>
      ))}
    </section>
  );
}
```

#### Approach B: Controlled State (More Animation Control)
```typescript
// Client Component
"use client";

import { useState } from "react";

type FAQProps = {
  items: Array<{ question: string; answer: string }>;
};

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section>
      {items.map((item, i) => (
        <div key={i} className="border-b">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left py-4 flex justify-between items-center"
          >
            <span>{item.question}</span>
            <span className={openIndex === i ? "rotate-180" : ""}>▼</span>
          </button>
          <div
            className={`overflow-hidden transition-all ${openIndex === i ? "max-h-96" : "max-h-0"}`}
          >
            <p className="pb-4">{item.answer}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
```

**Recommendation:** Use Approach A (native `<details>`) for simplicity and accessibility. Animations can be added in Phase 3 with CSS `details::marker` styling and toggle event listeners if needed.

### Pattern 5: Responsive Mobile-First Layout
**What:** Tailwind CSS breakpoints with unprefixed utilities for mobile, `md:` prefix for desktop
**When to use:** All responsive sections (navbar, hero, judging grid, footer)
**Example:**
```typescript
// Source: Tailwind CSS v4 docs
<nav className="fixed top-0 bg-background/80 backdrop-blur-xl">
  <div className="container mx-auto flex items-center justify-between h-16 px-4">
    <Logo />

    {/* Desktop nav - hidden on mobile */}
    <div className="hidden md:flex items-center gap-6">
      <a href="#hero">Hero</a>
      <a href="#manifesto">Manifesto</a>
      {/* ... */}
    </div>

    {/* Mobile hamburger - hidden on desktop */}
    <div className="md:hidden">
      <Hamburger toggled={isOpen} toggle={setIsOpen} />
    </div>
  </div>

  {/* Mobile menu panel - only shown when isOpen */}
  {isOpen && (
    <div className="md:hidden bg-background border-b">
      <div className="flex flex-col gap-4 px-4 py-4">
        <a href="#hero">Hero</a>
        <a href="#manifesto">Manifesto</a>
        {/* ... */}
      </div>
    </div>
  )}
</nav>
```

### Pattern 6: Translation Message Structure
**What:** Nested JSON objects for complex sections, flat keys for simple content
**When to use:** Structuring messages in `messages/es.json` and `messages/en.json`
**Example:**
```json
// Source: next-intl docs + project messages
{
  "navbar": {
    "hero": "Inicio",
    "manifesto": "Manifiesto",
    "judging": "Evaluación",
    "hubs": "Hubs",
    "sponsors": "Sponsors",
    "faq": "FAQ"
  },
  "hero": {
    "headline": "SpecHack 2025",
    "subheadline": "El hackathon global de 404 Tech Found",
    "eventDate": "Abril 2025",
    "howItWorks": "¿Cómo funciona?",
    "form": {
      "namePlaceholder": "Tu nombre",
      "emailPlaceholder": "Email",
      "cityPlaceholder": "Ciudad",
      "trackLabel": "Track",
      "trackVirtual": "Virtual",
      "trackHub": "Hub presencial",
      "submit": "Registrarse"
    }
  },
  "manifesto": {
    "title": "El Manifiesto",
    "intro": "Creemos que la tecnología debe ser accesible...",
    "phases": {
      "plan": {
        "title": "Plan",
        "description": "Define tu proyecto..."
      },
      "build": {
        "title": "Build",
        "description": "Construye tu solución..."
      },
      "present": {
        "title": "Present",
        "description": "Presenta tu demo..."
      }
    }
  },
  "faq": {
    "title": "Preguntas Frecuentes",
    "q1": "¿Cuándo es el evento?",
    "a1": "SpecHack 2025 se realizará en abril de 2025...",
    "q2": "¿Necesito experiencia previa?",
    "a2": "No, todos los niveles son bienvenidos..."
  }
}
```

### Anti-Patterns to Avoid
- **Don't use `"use client"` on sections with only static content** - Hero, Manifesto, Judging, Sponsors, Footer should be Server Components
- **Don't call `getTranslations()` in client components** - Fetches dictionary at runtime, defeats server-first i18n
- **Don't use `@apply` with Tailwind v4 theme variables** - Causes compilation errors (Phase 1 research)
- **Don't make forms functional in Phase 2** - Backend implementation is Phase 4 scope
- **Don't create barrel exports except for animations directory** - Project convention forbids barrel files

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll direction detection | Custom scroll listener with throttle/debounce | `useScrollDirection` hook (landing app) | Handles jitter, cleanup, passive listeners correctly |
| Language switching | Manual router.push with locale param | `useRouter` from `@/i18n/navigation` (next-intl) | Preserves pathname, handles scroll position, type-safe |
| Mobile hamburger icon | Custom SVG with CSS animation | `hamburger-react` package | Accessible, animated, customizable, battle-tested |
| Responsive breakpoints | Custom media query hooks | Tailwind CSS breakpoint prefixes (`md:`, `lg:`) | Mobile-first, consistent, no JS required |
| Accordion behavior | Custom collapse state management | Native `<details>`/`<summary>` elements | Accessible, no JS, semantic HTML, keyboard nav built-in |
| Form validation (Phase 4) | Manual error state + regex | Zod schemas with Server Actions | Type-safe, reusable, integrates with DB types |

**Key insight:** Next.js 16 + React 19 provide stable primitives (Server Components, `useActionState`, streaming) that eliminate need for custom data-fetching/form libraries. Use native HTML (`<details>`, `<form>`) when possible - client-side enhancement is easier than server-side polyfilling.

## Common Pitfalls

### Pitfall 1: Client Component Cascade
**What goes wrong:** Marking a parent component `"use client"` makes all children client components, even if they don't need interactivity. Loses server-side rendering benefits, inflates bundle size.
**Why it happens:** Mistakenly adding `"use client"` to page.tsx or layout components instead of isolating to interactive leaves.
**How to avoid:**
- Server components are the default - only add `"use client"` to components that use hooks, event handlers, or browser APIs
- Use composition pattern: server component renders client component with server-rendered children as props
- Phase 1 motion wrappers already isolate client boundaries
**Warning signs:**
- `getTranslations()` stops working (it's server-only)
- Bundle size increases unexpectedly
- Build shows "importing server-only module in client component" errors

### Pitfall 2: Translation Prop Shape Mismatch
**What goes wrong:** Server component passes incomplete or differently-shaped translation object to client component. Type errors or missing translations at runtime.
**Why it happens:** Adding new keys to messages/*.json but forgetting to update the props type definition.
**How to avoid:**
- Define strict TypeScript types for translation props: `type NavbarTranslations = { hero: string; manifesto: string; ... }`
- Use exhaustive prop spreading from `getTranslations()` result
- Test both locales (ES and EN) to catch missing keys early
**Warning signs:**
- TypeScript errors in client component about missing props
- UI shows translation keys instead of translated text
- Different behavior between `/es/` and `/en/` routes

### Pitfall 3: Form Action Premature Implementation
**What goes wrong:** Adding Server Action to form in Phase 2, creating database dependencies before Phase 4 validation/schema work is complete.
**Why it happens:** Forms look incomplete without submit handlers, temptation to "finish" the feature.
**How to avoid:**
- Use `type="button"` on submit buttons (prevents form submission)
- Add `onSubmit={(e) => e.preventDefault()}` to forms with clear comment: `// TODO: Phase 4 - implement Server Action`
- Focus on UI/UX correctness: validation messages, loading states, error boundaries are Phase 4 scope
**Warning signs:**
- TypeScript errors about missing database imports
- Form submissions cause page reloads or 404 errors
- Attempting to import Zod schemas before they're created

### Pitfall 4: Mobile Menu Z-Index Conflicts
**What goes wrong:** Mobile menu drawer renders behind other fixed elements (hero content, footer CTAs). User can't interact with menu.
**Why it happens:** Insufficient z-index on navbar, or conflicting stacking contexts from parent elements.
**How to avoid:**
- Use consistent z-index scale: navbar `z-40`, mobile menu `z-40` (same context), modals `z-50`
- Test on actual mobile device or responsive mode - desktop Chrome doesn't always show z-index bugs
- Verify `fixed` positioning works correctly with Tailwind's `container` utility
**Warning signs:**
- Hamburger icon visible but menu panel doesn't appear
- Menu appears but clicks pass through to content below
- Menu works on desktop but not mobile (viewport-specific stacking context)

### Pitfall 5: Anchor Navigation Breaking Scroll Behavior
**What goes wrong:** Clicking navbar links to `#hero`, `#manifesto` etc. doesn't scroll or scrolls incorrectly due to fixed header offset.
**Why it happens:** Fixed navbar covers top of target section, or smooth scroll behavior conflicts with next-intl routing.
**How to avoid:**
- Add `scroll-padding-top` CSS to account for fixed navbar height: `html { scroll-padding-top: 4rem; }`
- Use plain `<a href="#section">` for same-page navigation (not next/link)
- Test with navbar visible and hidden (scroll direction hide/show)
**Warning signs:**
- Clicking nav link jumps to section but content is partially hidden under navbar
- Scroll animation feels janky or instant (missing `scroll-behavior: smooth`)
- Anchor links work on desktop but not mobile (different navbar heights)

### Pitfall 6: Translation Key Naming Inconsistency
**What goes wrong:** Mixing naming conventions between ES and EN message files. Keys don't match, causing "missing translation" errors that only appear in one locale.
**Why it happens:** Copy-pasting JSON structure from one locale, renaming keys inconsistently.
**How to avoid:**
- Keep identical key structure in both `messages/es.json` and `messages/en.json` - only values differ
- Use linting or validation to ensure key parity (next-intl can validate at build time)
- Test route switching between locales frequently during development
**Warning signs:**
- Translation works in ES but shows raw key in EN (or vice versa)
- Type errors in one locale but not the other
- Build warnings about missing keys

## Code Examples

Verified patterns from official sources:

### Server Component Section Structure
```typescript
// Source: Next.js 16 docs + project patterns
// apps/spechack/src/app/[locale]/_components/Manifesto.tsx

import { getTranslations } from "next-intl/server";

export async function Manifesto() {
  const t = await getTranslations("manifesto");

  const phases = [
    { key: "plan", title: t("phases.plan.title"), desc: t("phases.plan.description") },
    { key: "build", title: t("phases.build.title"), desc: t("phases.build.description") },
    { key: "present", title: t("phases.present.title"), desc: t("phases.present.description") },
  ];

  return (
    <section id="manifesto" className="min-h-screen py-20 px-6">
      <h2 className="text-4xl font-bold">{t("title")}</h2>
      <p className="text-lg mt-4">{t("intro")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {phases.map((phase) => (
          <div key={phase.key} className="bg-card p-6 rounded-lg border">
            <h3 className="text-2xl font-bold">{phase.title}</h3>
            <p className="text-muted-foreground mt-2">{phase.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Navbar with Language Switcher
```typescript
// Source: apps/landing/src/app/[locale]/_components/Navbar.tsx (adapted)
"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Squash as Hamburger } from "hamburger-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useRouter, usePathname } from "@/i18n/navigation";

type NavbarProps = {
  locale: "es" | "en";
  translations: {
    hero: string;
    manifesto: string;
    judging: string;
    hubs: string;
    sponsors: string;
    faq: string;
  };
};

export function Navbar({ locale, translations }: NavbarProps) {
  const scrollDirection = useScrollDirection();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { label: translations.hero, target: "hero" },
    { label: translations.manifesto, target: "manifesto" },
    { label: translations.judging, target: "judging" },
    { label: translations.hubs, target: "hubs" },
    { label: translations.sponsors, target: "sponsors" },
    { label: translations.faq, target: "faq" },
  ];

  const handleLanguageSwitch = (newLocale: "es" | "en") => {
    router.replace(pathname, { locale: newLocale, scroll: false });
  };

  const handleNavLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav
      style={{
        transform: scrollDirection === "down" ? "translateY(-100%)" : "translateY(0)",
      }}
      className={clsx(
        "fixed top-0 left-0 right-0 z-40",
        "bg-background/80 backdrop-blur-xl border-b border-border",
        "transition-all duration-300"
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo placeholder */}
        <div className="font-bold text-lg">SpecHack</div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.target}
              href={`#${link.target}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Language switcher */}
          <div className="text-xs font-mono-accent border border-border rounded px-2 py-1 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleLanguageSwitch("es")}
              className={clsx(
                "transition-colors",
                locale === "es"
                  ? "font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ES
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              type="button"
              onClick={() => handleLanguageSwitch("en")}
              className={clsx(
                "transition-colors",
                locale === "en"
                  ? "font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <Hamburger toggled={isOpen} toggle={setIsOpen} size={20} color="hsl(var(--foreground))" />
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.target}
                href={`#${link.target}`}
                onClick={handleNavLinkClick}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile language switcher */}
            <div className="text-xs font-mono-accent border border-border rounded px-2 py-1 flex items-center gap-1.5 w-fit">
              <button
                type="button"
                onClick={() => handleLanguageSwitch("es")}
                className={clsx(
                  "transition-colors",
                  locale === "es"
                    ? "font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ES
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                type="button"
                onClick={() => handleLanguageSwitch("en")}
                className={clsx(
                  "transition-colors",
                  locale === "en"
                    ? "font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
```

### Page Composition (Server Root)
```typescript
// Source: Next.js 16 docs + project patterns
// apps/spechack/src/app/[locale]/page.tsx

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { Manifesto } from "./_components/Manifesto";
import { Judging } from "./_components/Judging";
import { Hubs } from "./_components/Hubs";
import { Sponsors } from "./_components/Sponsors";
import { FAQ } from "./_components/FAQ";
import { Footer } from "./_components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch navbar translations
  const navT = await getTranslations("navbar");

  return (
    <>
      <Navbar
        locale={locale as "es" | "en"}
        translations={{
          hero: navT("hero"),
          manifesto: navT("manifesto"),
          judging: navT("judging"),
          hubs: navT("hubs"),
          sponsors: navT("sponsors"),
          faq: navT("faq"),
        }}
      />

      <main>
        {/* All sections are async Server Components */}
        <Hero />
        <Manifesto />
        <Judging />
        <Hubs />
        <Sponsors />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
```

### FAQ Accordion (Native Details Approach)
```typescript
// Source: MDN docs + next-intl patterns
// apps/spechack/src/app/[locale]/_components/FAQ.tsx

import { getTranslations } from "next-intl/server";

export async function FAQ() {
  const t = await getTranslations("faq");

  const items = [
    { id: 1, question: t("q1"), answer: t("a1") },
    { id: 2, question: t("q2"), answer: t("a2") },
    { id: 3, question: t("q3"), answer: t("a3") },
    { id: 4, question: t("q4"), answer: t("a4") },
  ];

  return (
    <section id="faq" className="min-h-screen py-20 px-6">
      <h2 className="text-4xl font-bold mb-12">{t("title")}</h2>

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item) => (
          <details key={item.id} className="border border-border rounded-lg">
            <summary className="cursor-pointer py-4 px-6 font-semibold hover:text-primary transition-colors">
              {item.question}
            </summary>
            <div className="px-6 pb-4 text-muted-foreground">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
```

### Form Placeholder (Non-Functional)
```typescript
// Source: Project requirements + Phase 4 deferred scope
// apps/spechack/src/app/[locale]/_components/Hero.tsx (excerpt)

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold purple-glow">{t("headline")}</h1>
        <p className="text-xl text-muted-foreground mt-4">{t("subheadline")}</p>
        <time className="block text-lg mt-2">{t("eventDate")}</time>

        {/* Form placeholder - Phase 4 will add Server Action */}
        <form className="mt-12 max-w-md mx-auto space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t("form.namePlaceholder")}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder={t("form.emailPlaceholder")}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg"
          />
          <input
            type="text"
            name="city"
            placeholder={t("form.cityPlaceholder")}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg"
          />

          {/* Track toggle - presentational only */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="track" value="virtual" defaultChecked />
              <span>{t("form.trackVirtual")}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="track" value="hub" />
              <span>{t("form.trackHub")}</span>
            </label>
          </div>

          {/* Button type="button" prevents submission until Phase 4 */}
          <button
            type="button"
            className="w-full bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t("form.submit")}
          </button>
        </form>

        <a
          href="#manifesto"
          className="inline-block mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("howItWorks")} ↓
        </a>
      </div>
    </section>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side i18n (react-i18next) | Server-first i18n (next-intl) | Next.js 13+ App Router | Translations ship as static HTML, no runtime bundle cost |
| Custom accordion components | Native `<details>`/`<summary>` | Baseline web standard (2020) | Accessible by default, no JS required, semantic HTML |
| getServerSideProps | Server Components with async/await | Next.js 13+ (stable in 15+) | Simpler DX, no serialization, better streaming |
| useState + fetch for forms | useActionState + Server Actions | React 19 stable (2024) | Progressive enhancement, type-safe, no API routes |
| CSS-in-JS (styled-components) | Tailwind CSS v4 with @theme | Tailwind v4 (2024) | Zero-runtime, CSS variables, better RSC compatibility |

**Deprecated/outdated:**
- `getStaticProps`/`getServerSideProps`: Replaced by async Server Components in App Router
- `pages/` directory: App Router (`app/`) is the standard for new projects
- `next-i18next`: Community fork, next-intl is official and server-first
- Custom form validation hooks: `useActionState` + Zod schemas + Server Actions is the pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Accordion animation smoothness**
   - What we know: Native `<details>` has instant open/close, no animation. CSS transitions on `max-height` are possible but janky. Framer Motion can animate `height: "auto"` with `layoutId`.
   - What's unclear: Best practice for accessible + smooth accordion animation in Server Components. Native `<details>` is accessible but lacks animation control. Controlled state gives animation but requires client component.
   - Recommendation: Start with native `<details>` in Phase 2 (simplicity, accessibility). Add animation in Phase 3 by wrapping in client component or using CSS `toggle` event listener if needed.

2. **Logo/branding assets**
   - What we know: Requirements mention "SpecHack logo" and "404 Tech Found parent logo" in Footer (LAND-09). No assets provided in codebase.
   - What's unclear: Where logo files are located, what format (SVG, PNG), whether they exist yet.
   - Recommendation: Use text placeholders ("SpecHack", "404 Tech Found") in Phase 2. Logo integration can happen when assets are provided.

3. **Blueprint grid background application scope**
   - What we know: Phase 1 created `.blueprint-grid` utility class. Landing app applies it to `body` element.
   - What's unclear: Should blueprint grid be on body (global) or specific sections only?
   - Recommendation: Apply `blueprint-grid` class to `<body>` in layout.tsx for consistency with landing app. Can be scoped to sections later if needed.

## Sources

### Primary (HIGH confidence)
- Next.js 16 Server Components docs - https://nextjs.org/docs/app/building-your-application/rendering/server-components (verified 2026-02-11)
- next-intl Messages docs - https://next-intl.dev/docs/usage/messages (verified patterns)
- MDN `<details>` element docs - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details (baseline 2020+)
- Next.js Server Actions docs - https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations (verified 2026-02-11)
- Tailwind CSS v4 responsive design docs - https://tailwindcss.com/docs/responsive-design (verified patterns)
- Project codebase - apps/landing Navbar.tsx, useScrollDirection.ts, useBannerHeight.ts (established patterns)

### Secondary (MEDIUM confidence)
- Framer Motion scroll animations - https://motion.dev/motion/scroll-animations/ (redirected, partial content)
- Project CLAUDE.md - Architecture patterns, tech stack, conventions (authoritative for project-specific decisions)

### Tertiary (LOW confidence)
- None - all findings verified with official sources or established codebase patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed in Phase 1, versions verified in package.json
- Architecture: HIGH - Patterns verified in Next.js 16 docs and landing app codebase
- Translation patterns: HIGH - next-intl official docs + working implementation in landing app
- Accordion patterns: HIGH - MDN baseline docs + native HTML standard
- Scroll patterns: HIGH - Verified landing app implementation (useScrollDirection hook)
- Form handling: MEDIUM - Phase 2 forms are placeholders, actual implementation deferred to Phase 4
- Pitfalls: HIGH - Based on Next.js docs, project conventions, and common migration mistakes

**Research date:** 2026-02-13
**Valid until:** ~60 days (Next.js 16 stable, Tailwind v4 stable, React 19 stable - slow-moving tech)
