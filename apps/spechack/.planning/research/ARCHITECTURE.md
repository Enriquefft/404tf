# Architecture Patterns

**Domain:** Next.js 16 Hackathon Landing Page with Trading Cards
**Researched:** 2026-02-13
**Confidence:** HIGH

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Navigation UI  │  │ Animations      │  │ Canvas Export   │  │
│  │ (Client)       │  │ (Client)        │  │ (Client)        │  │
│  │ - Language     │  │ - Framer Motion │  │ - Card PNG      │  │
│  │ - Mobile Menu  │  │ - Scroll Reveal │  │ - Trading Card  │  │
│  │ - Accordion    │  │ - Card Reveal   │  │                 │  │
│  └────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                   │                    │             │
│           └───────────────────┴────────────────────┘             │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │ Props (translated strings, data)
┌───────────────────────────────┼──────────────────────────────────┐
│                        Server Components                         │
│  ┌────────────────────────────┴────────────────────────┐         │
│  │            Static Content (Server)                  │         │
│  │  - Hero, Manifesto, Judging, Hubs, Sponsors, FAQ   │         │
│  │  - Fetch translations via getTranslations()        │         │
│  │  - Pass translated strings as props to client      │         │
│  └──────────────┬───────────────────────┬──────────────┘         │
│                 │                       │                        │
│  ┌──────────────▼───────────┐  ┌───────▼───────────────┐        │
│  │   Route Handlers         │  │  Metadata Generation  │        │
│  │   - /api/register        │  │  - Dynamic OG Images  │        │
│  │   - /api/ambassador      │  │  - /c/[name] preview  │        │
│  └──────────────┬───────────┘  └───────────────────────┘        │
│                 │                                                │
└─────────────────┼────────────────────────────────────────────────┘
                  │ Server Actions
┌─────────────────┼────────────────────────────────────────────────┐
│            Database Layer (Shared Package)                       │
│  ┌──────────────▼─────────────────────────────────────┐          │
│  │            @404tf/database                         │          │
│  │  - Drizzle ORM schemas (spechack_ prefix)         │          │
│  │  - Neon Postgres connection                       │          │
│  │  - Type-safe queries shared across monorepo       │          │
│  └────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Render Location |
|-----------|---------------|-------------------|-----------------|
| **Navbar** | Navigation, language toggle, mobile menu | Client-side state only | Client (interactive) |
| **Hero** | Static headline + call-to-action | RegistrationForm (client child) | Server (static) wrapping Client (form) |
| **RegistrationForm** | Form state, validation, submission | Server Actions via useActionState | Client (forms) |
| **TradingCard** | Display card with animation | None (receives props) | Server for display, Client for reveal animation |
| **CardExport** | Canvas PNG export | Browser Canvas API | Client (browser API) |
| **ChallengeRoute** | Dynamic /c/[name] page | Database for existing cards, Server Actions for registration | Server page + Client form |
| **Manifesto/Judging/Hubs/Sponsors/FAQ** | Static content sections | FadeInSection (client wrapper) | Server (static) wrapped in Client (animations) |
| **Accordion** | Interactive expand/collapse UI | Client-side state only | Client (interactive) |
| **StickyRegisterButton** | Scroll-triggered floating CTA | Client scroll event | Client (browser API) |
| **Footer** | Static links + social | None (static) | Server (static) |
| **OGImageRoute** | Dynamic OG image at /c/[name]/opengraph-image | Database for card data, ImageResponse API | Server (metadata) |

### Data Flow

**Registration Flow:**
```
User fills form (Client)
  → useActionState calls Server Action
    → Server Action validates with Zod
      → Insert to Neon via Drizzle (@404tf/database)
        → Return sequential agent number + success state
          → Client receives FormState, displays success + card
            → User exports card as PNG via Canvas API (Client)
```

**Challenge Link Flow:**
```
User visits /[locale]/c/[first-name] (Server)
  → Page component awaits params
    → Query database for existing participant by name
      → If found: Pre-fill card preview (Server)
        → Pass data as props to client RegistrationForm
      → If not found: Generate deterministic card from name hash (Server)
        → Display challenge invitation with card preview
          → Registration form (Client) allows challenged user to register
```

**Translation Flow:**
```
Server Component calls getTranslations() from next-intl
  → Receives typed translation object
    → Passes individual translated strings as props to Client Components
      → Client Components receive plain strings (serializable)
        → No runtime dictionary lookup needed in Client
```

**Animation Flow:**
```
Server Component renders static content
  → Wraps children in <FadeInSection> (Client Component)
    → FadeInSection uses Framer Motion (browser API)
      → Renders children prop (can be Server Components)
        → Server-rendered HTML passed through to animated wrapper
```

## Patterns to Follow

### Pattern 1: Server-First Content, Client-Wrapped Animations
**What:** Static content sections rendered as Server Components, wrapped in client animation components via `children` prop.

**When:** Any section with static text that needs scroll-triggered animations.

**Example:**
```typescript
// app/[locale]/_components/Manifesto.tsx (Server Component)
import { getTranslations } from "next-intl/server";
import { FadeInSection } from "./animations/FadeInSection";

export async function Manifesto() {
  const t = await getTranslations("hackathon.manifesto");

  return (
    <FadeInSection>
      <section className="py-24">
        <h2>{t("headline")}</h2>
        <p>{t("description")}</p>
      </section>
    </FadeInSection>
  );
}

// app/[locale]/_components/animations/FadeInSection.tsx (Client Component)
"use client";

import { motion } from "framer-motion";

export function FadeInSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
```

**Why:** Minimizes client JavaScript bundle, allows Server Components to remain static while layering interactivity only where needed.

### Pattern 2: Translation Prop-Drilling from Server to Client
**What:** Server Components fetch translations, pass individual strings as props to Client Components (not entire dictionaries).

**When:** Any Client Component that displays localized text.

**Example:**
```typescript
// app/[locale]/_components/RegistrationSection.tsx (Server Component)
import { getTranslations } from "next-intl/server";
import { RegistrationForm } from "./RegistrationForm";

export async function RegistrationSection({ locale }: { locale: "es" | "en" }) {
  const t = await getTranslations("hackathon.registration");

  return (
    <section>
      <RegistrationForm
        locale={locale}
        translations={{
          nameLabel: t("nameLabel"),
          emailLabel: t("emailLabel"),
          submitButton: t("submit"),
          successMessage: t("success"),
        }}
      />
    </section>
  );
}

// app/[locale]/_components/RegistrationForm.tsx (Client Component)
"use client";

import { useActionState } from "react";

type Props = {
  locale: "es" | "en";
  translations: {
    nameLabel: string;
    emailLabel: string;
    submitButton: string;
    successMessage: string;
  };
};

export function RegistrationForm({ locale, translations }: Props) {
  // Form uses translations directly as plain strings
  return <form>...</form>;
}
```

**Why:** Avoids shipping translation dictionaries to client, keeps translations server-side, passes only needed strings.

### Pattern 3: useActionState for Forms + Server Actions
**What:** Client Components use `useActionState` hook for form state management, calling Server Actions that validate with Zod and interact with database.

**When:** Any form submission (registration, ambassador application).

**Example:**
```typescript
// app/[locale]/_actions/registration.actions.ts (Server Action)
"use server";

import { z } from "zod";
import { db } from "@404tf/database";
import { participants } from "@404tf/database/schema";

const registrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(2),
  track: z.enum(["ai", "biotech", "hardware"]),
  locale: z.enum(["es", "en"]),
});

export type FormState = {
  success: boolean;
  message: string;
  agentNumber?: number;
  errors?: { name?: string[]; email?: string[]; city?: string[]; track?: string[] };
} | null;

export async function registerParticipant(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validation = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    city: formData.get("city"),
    track: formData.get("track"),
    locale: formData.get("locale"),
  });

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    // Insert returns sequential agent number from DB
    const [result] = await db.insert(participants).values(validation.data).returning({ agentNumber: participants.agentNumber });

    return {
      success: true,
      message: "success",
      agentNumber: result.agentNumber,
    };
  } catch (error) {
    return {
      success: false,
      message: "Database error",
    };
  }
}

// app/[locale]/_components/RegistrationForm.tsx (Client Component)
"use client";

import { useActionState } from "react";
import { registerParticipant, type FormState } from "../_actions/registration.actions";

export function RegistrationForm({ locale, translations }: Props) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    registerParticipant,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      <input name="name" placeholder={translations.nameLabel} />
      {state?.errors?.name && <p>{state.errors.name[0]}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? translations.submitting : translations.submitButton}
      </button>

      {state?.success && <p>{translations.successMessage} Agent #{state.agentNumber}</p>}
    </form>
  );
}
```

**Why:** Built-in React 19 pattern for Server Actions, handles pending state automatically, type-safe form state.

### Pattern 4: Dynamic OG Images via ImageResponse
**What:** Use Next.js `next/og` ImageResponse API to generate dynamic OG images for challenge links at `/[locale]/c/[name]/opengraph-image`.

**When:** Dynamic social previews for shareable challenge links.

**Example:**
```typescript
// app/[locale]/c/[name]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { db } from "@404tf/database";
import { participants } from "@404tf/database/schema";
import { eq } from "drizzle-orm";

export const alt = "SpecHack Challenge Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}) {
  const { name } = await params;

  // Query database for participant
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.name, name))
    .limit(1);

  // Generate deterministic card if not found
  const cardData = participant || generateCardFromHash(name);

  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: 72, color: "white" }}>
          {cardData.name} - Agent #{cardData.agentNumber}
        </div>
      </div>
    ),
    { ...size }
  );
}
```

**Why:** Server-rendered dynamic images, no external service needed, 500KB bundle limit encourages efficient assets.

### Pattern 5: Canvas API in Client Component
**What:** Canvas PNG export functionality isolated in Client Component marked with `"use client"`.

**When:** Trading card PNG download feature.

**Example:**
```typescript
// app/[locale]/_components/CardExport.tsx
"use client";

import { useRef } from "react";

export function CardExport({ cardData }: { cardData: CardData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // Draw card to canvas...

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `spechack-agent-${cardData.agentNumber}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" width={800} height={1000} />
      <button onClick={handleExport}>Download Card</button>
    </>
  );
}
```

**Why:** Canvas API is browser-only, requires client component, isolated to single component to minimize client JS.

### Pattern 6: Shared Database Package via Monorepo
**What:** Database schema and Drizzle client live in `@404tf/database` workspace package, shared across apps.

**When:** Any database interaction from multiple apps in monorepo.

**Example:**
```typescript
// packages/database/src/schema.ts
import { pgSchema, serial, text, timestamp } from "drizzle-orm/pg-core";

const schema = pgSchema("404 Tech Found");

export const participants = schema.table("spechack_participants", {
  id: serial("id").primaryKey(),
  agentNumber: serial("agent_number").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  track: text("track").notNull(), // Use enum in actual schema
  createdAt: timestamp("created_at").defaultNow(),
});

// packages/database/src/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export * from "./schema";

// apps/spechack/src/app/[locale]/_actions/registration.actions.ts
import { db, participants } from "@404tf/database";
// Types are shared, single schema source of truth
```

**Why:** Single source of truth for schema, types synced automatically, eliminates duplicate schema definitions.

### Pattern 7: Nested Dynamic Routes with next-intl
**What:** `/[locale]/c/[name]` pattern where locale is handled by next-intl routing, and name is an additional dynamic segment.

**When:** Challenge links with localized URLs.

**Example:**
```typescript
// app/[locale]/c/[name]/page.tsx
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db, participants } from "@404tf/database";
import { eq } from "drizzle-orm";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}) {
  const { locale, name } = await params;
  setRequestLocale(locale);

  // Query participant by name
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.name, name))
    .limit(1);

  if (!participant) {
    notFound();
  }

  return (
    <div>
      <h1>Challenge from {participant.name}</h1>
      {/* Card preview + registration form */}
    </div>
  );
}
```

**Why:** next-intl handles locale routing transparently, additional dynamic segments work as standard Next.js patterns, generateStaticParams required for build-time rendering.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client Component at Route Root
**What:** Marking entire route page as `"use client"` when only small portions need interactivity.

**Why bad:** Ships unnecessary JavaScript, loses server-side rendering benefits, breaks next-intl SSR patterns.

**Instead:** Keep page as Server Component, import Client Components for interactive portions only.

### Anti-Pattern 2: Runtime Translation Dictionary in Client
**What:** Passing entire translation dictionary to Client Component and using `useTranslations()` client-side.

**Why bad:** Ships all translations to browser, violates next-intl SSR-first pattern, larger bundle size.

**Instead:** Fetch translations server-side with `getTranslations()`, pass individual strings as props to Client Components.

### Anti-Pattern 3: API Routes for Form Submissions
**What:** Creating `/api/register` Route Handler and calling it from client with fetch.

**Why bad:** Unnecessary network round-trip, loses type safety, more boilerplate than Server Actions.

**Instead:** Use Server Actions with `useActionState` for direct server function calls with type safety.

### Anti-Pattern 4: Large Framer Motion Component Trees
**What:** Marking parent component as `"use client"` and nesting all children inside for animations.

**Why bad:** Converts entire tree to client bundle, loses server rendering for static content.

**Instead:** Use `children` prop pattern — static Server Components passed to Client animation wrappers.

### Anti-Pattern 5: Canvas Rendering on Every Render
**What:** Re-drawing Canvas on every component render without memoization.

**Why bad:** Performance degradation, unnecessary repaints, battery drain on mobile.

**Instead:** Use `useEffect` with dependencies, memoize card data, only redraw when data changes.

### Anti-Pattern 6: Multiple Database Packages
**What:** Duplicating Drizzle schema across apps, maintaining separate database packages.

**Why bad:** Type drift between apps, schema changes require updates in multiple places, inconsistent data.

**Instead:** Single `@404tf/database` workspace package shared across monorepo apps.

### Anti-Pattern 7: Mixing Tailwind v3 and v4 Syntax
**What:** Using `@apply` directives with theme variables in Tailwind v4.

**Why bad:** Tailwind v4 changed architecture, `@apply` with theme variables causes build errors.

**Instead:** Use direct CSS custom properties with `@theme` declarations or inline utility classes.

## Scalability Considerations

| Concern | At 100 participants | At 10K participants | At 1M participants |
|---------|---------------------|---------------------|-------------------|
| **OG Image Generation** | On-demand rendering per request | Add Vercel Edge caching headers (1 hour TTL) | Pre-generate OG images at registration time, store in CDN |
| **Database Queries** | Direct Drizzle queries | Add indexes on `name`, `email`, agent queries | Add read replicas, cache frequently accessed cards in Redis |
| **Static Generation** | Full ISR for all challenge routes | On-demand ISR with revalidation | Switch to dynamic routes with aggressive edge caching |
| **Translation Loading** | Load all locales | Load all locales (small JSON) | Consider splitting large translations by route |
| **Client Bundle Size** | ~150KB (Framer Motion + React) | Same | Consider code splitting Framer Motion by route if exceeds 200KB |
| **Form Submissions** | Direct Server Actions | Rate limiting per IP (10/min) | Add Cloudflare Turnstile or similar CAPTCHA |

## Suggested Build Order

The following order respects dependencies and enables incremental testing:

### Phase 1: Foundation (No Dependencies)
1. **Monorepo Setup** — Configure `apps/spechack/` directory, install dependencies
2. **next-intl Routing** — Set up `src/proxy.ts`, `src/i18n/routing.ts`, `[locale]` layout
3. **Shared Database Schema** — Add `spechack_participants` and `spechack_ambassadors` tables to `@404tf/database`
4. **Global Styles** — Tailwind v4 config, fonts (Orbitron, JetBrains Mono), dark theme CSS variables

### Phase 2: Static Components (Depends on Phase 1)
5. **Navbar** (Client) — Language toggle, mobile menu, scroll-aware background
6. **Footer** (Server) — Static links, social icons
7. **Hero** (Server) — Static headline, wraps RegistrationForm placeholder
8. **Manifesto/Judging/Hubs/Sponsors/FAQ** (Server) — Static content sections

### Phase 3: Animations (Depends on Phase 2)
9. **FadeInSection** (Client wrapper) — Framer Motion scroll-triggered reveal
10. **Wrap Static Sections** — Add FadeInSection around Phase 2 components
11. **CardReveal Animation** (Client) — Stagger animation for trading card reveal

### Phase 4: Forms + Server Actions (Depends on Phase 1, 3)
12. **Registration Server Action** — `registration.actions.ts` with Zod validation
13. **RegistrationForm** (Client) — useActionState integration, form UI
14. **Ambassador Server Action** — `ambassador.actions.ts` with Zod validation
15. **AmbassadorForm** (Client) — useActionState integration, form UI

### Phase 5: Trading Cards (Depends on Phase 4)
16. **Card Generation Logic** (Server) — Deterministic hash → gradient + class
17. **TradingCardDisplay** (Server) — Static card rendering
18. **CardExport** (Client) — Canvas API PNG download
19. **CardReveal Integration** — Show card after successful registration

### Phase 6: Challenge Routes (Depends on Phase 5)
20. **Challenge Page Route** — `/[locale]/c/[name]/page.tsx` with DB query
21. **Challenge OG Image** — `/[locale]/c/[name]/opengraph-image.tsx` with ImageResponse
22. **Dynamic Metadata** — Challenge page metadata with participant name

### Phase 7: Polish (Depends on Phase 2-6)
23. **Accordion** (Client) — FAQ interactive expand/collapse
24. **StickyRegisterButton** (Client) — Scroll-triggered floating CTA
25. **Error Boundaries** — Graceful error handling for DB failures
26. **Loading States** — Suspense boundaries for async components

## Sources

**Official Documentation (HIGH Confidence):**
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js: ImageResponse API](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [next-intl: Routing Configuration](https://next-intl.dev/docs/routing/configuration)
- [Next.js: Forms and Server Actions](https://nextjs.org/docs/app/guides/forms)

**Community Best Practices (MEDIUM Confidence):**
- [Next.js App Router Pitfalls (2026)](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [React Server Components Practical Guide (2026)](https://inhaq.com/blog/react-server-components-practical-guide-2026.html)
- [Next.js Server Actions Complete Guide (2026)](https://makerkit.dev/blog/tutorials/nextjs-server-actions)
- [Shared Database Schema with Drizzle and Turborepo](https://pliszko.com/blog/post/2023-08-31-shared-database-schema-with-drizzleorm-and-turborepo)
- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [Dynamic OG Images Generation with Next.js](https://makerkit.dev/blog/tutorials/dynamic-og-image)

**Ecosystem References (MEDIUM Confidence):**
- [Next.js App Router Project Structure Guide](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure)
- [Next.js Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/nextjs-complete-guide)
