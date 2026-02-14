# Phase 4: Forms & Database - Research

**Researched:** 2026-02-14
**Domain:** Server Actions, Zod validation, Drizzle ORM, next-intl metadata, sequential ID generation
**Confidence:** HIGH

## Summary

Phase 4 wires up the two presentational forms (Hero registration and Hubs ambassador application) to Neon Postgres via Server Actions, and adds locale-aware SEO metadata. The landing app already has a proven Server Action pattern in `apps/landing/src/app/[locale]/_actions/intent.actions.ts` that uses `useActionState` + Zod + `@404tf/database`. This phase replicates that pattern for SpecHack.

The database schema was created in Phase 1 but has several mismatches with the requirements that must be resolved: the `track` enum uses technical categories instead of `virtual/hub`, there is no `gradient` column for REG-04, and the ambassador table uses `university`/`motivation` instead of the simpler `community` field from AMB-02. These schema changes must be made and migrated before form work begins.

**Primary recommendation:** Follow the landing app's exact Server Action pattern (FormState type, Zod safeParse, field error propagation). Fix schema mismatches first via Drizzle migration. Use a PostgreSQL sequence for collision-free agent number assignment.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | latest | Database ORM for Neon Postgres | Already in `@404tf/database`, proven in landing app |
| zod | ^4.3.6 | Form validation schemas | Already installed in spechack app |
| next (Server Actions) | ^16.1.6 | `"use server"` actions with `useActionState` | React 19 built-in pattern, proven in landing app |
| next-intl | ^4.8.2 | `getTranslations` for metadata + form labels | Already configured for spechack |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @404tf/database | workspace:* | Shared DB client + schema | All database operations |
| @404tf/database/schema | workspace:* | Table/enum exports | Import in Server Actions |

### No New Dependencies Needed
Everything required is already installed. No new packages needed for Phase 4.

## Architecture Patterns

### Recommended File Structure
```
src/app/[locale]/
  _actions/
    register.actions.ts       # Registration Server Action + Zod schema
    ambassador.actions.ts     # Ambassador Server Action + Zod schema
  _components/
    RegistrationForm.tsx      # "use client" - form with useActionState
    AmbassadorForm.tsx        # "use client" - expandable form with useActionState
    Hero.tsx                  # Server component (passes translations to form)
    Hubs.tsx                  # Server component (passes translations to form)
  layout.tsx                  # generateMetadata for SEO
src/lib/
  card-utils.ts               # Deterministic gradient + builder class generation (server-safe)
  metadata/
    seo-config.ts             # SITE_NAME, SITE_URL constants
packages/database/src/
  schema.ts                   # Updated enums + columns
```

### Pattern 1: Server Action with FormState (from landing app)
**What:** Server Action receives `FormData`, validates with Zod, returns typed `FormState`
**When to use:** All form submissions
**Example:**
```typescript
// Source: apps/landing/src/app/[locale]/_actions/intent.actions.ts
"use server";

import { z } from "zod";
import { db } from "@404tf/database";
import { spechackParticipants } from "@404tf/database/schema";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(1),
  track: z.enum(["virtual", "hub"]),
  locale: z.enum(["es", "en"]),
});

export type RegisterFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: { agentNumber: string; builderClass: string; gradient: object };
} | null;

export async function submitRegistration(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  // 1. Parse + validate
  // 2. Check duplicate email (return existing data)
  // 3. Generate builder class + gradient deterministically
  // 4. Insert with next agent number from sequence
  // 5. Return card data in FormState
}
```

### Pattern 2: Client Form with useActionState
**What:** Client component wraps `<form>` with `useActionState` hook, passes `action` prop
**When to use:** All interactive forms
**Example:**
```typescript
"use client";

import { useActionState } from "react";
import { submitRegistration, type RegisterFormState } from "../_actions/register.actions";

export function RegistrationForm({ translations }: { translations: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(submitRegistration, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      {state?.errors?.name && <p className="text-red-500">{state.errors.name[0]}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "..." : translations.submit}
      </button>
    </form>
  );
}
```

### Pattern 3: Translation Prop-Drilling for Forms
**What:** Server component fetches translations, passes as props to client form component
**When to use:** All form components (established in Phase 2)
**Example:**
```typescript
// Hero.tsx (server component)
export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <RegistrationForm
      translations={{
        name: t("formName"),
        email: t("formEmail"),
        // ...
      }}
    />
  );
}
```

### Pattern 4: Locale-Aware Metadata with generateMetadata
**What:** Async `generateMetadata` function in layout.tsx using `getTranslations`
**When to use:** SEO metadata for locale-specific pages
**Example:**
```typescript
// Source: apps/landing/src/app/[locale]/layout.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { template: `%s | ${SITE_NAME}`, default: t("title") },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en" },
    },
    openGraph: { /* ... */ },
    twitter: { /* ... */ },
  };
}
```

### Anti-Patterns to Avoid
- **Importing `db` in client components:** Database operations MUST be in Server Actions only
- **Using `useTranslations` in forms for validation messages:** Validation happens server-side; return error messages from the Server Action
- **Random agent numbers:** Blueprint uses `Math.random()` -- production MUST use DB sequence
- **Client-side duplicate detection:** Always check server-side with `WHERE email = ?`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sequential IDs | Counter table with manual locks | PostgreSQL `SERIAL` or `nextval()` sequence | Race conditions under concurrent inserts |
| Form state management | Custom useState for loading/errors | `useActionState` (React 19) | Built-in pending state, progressive enhancement |
| Email validation | Regex patterns | Zod `.email()` | Handles edge cases (IDN, quoted strings) |
| Duplicate detection | Client-side localStorage check | DB `UNIQUE` constraint + `ON CONFLICT` | Only server-side is authoritative |

**Key insight:** The landing app's `intent.actions.ts` is a battle-tested template. Copy its structure exactly rather than inventing a new pattern.

## Schema Gaps (CRITICAL)

The Phase 1 schema has mismatches with Phase 4 requirements that must be resolved:

### Gap 1: Track Enum Mismatch
**Current:** `spechack_track` = `["web", "mobile", "ai", "iot", "open"]`
**Required (REG-04):** Track should be `virtual` or `hub` (UI toggle in Hero form)
**Resolution:** Replace enum values with `["virtual", "hub"]` or add a new enum. Since the existing enum was created in Phase 1 but never populated with data, a clean replacement via migration is safe.

### Gap 2: Missing Gradient Data Column (REG-04)
**Current:** No gradient column in `spechack_participants`
**Required:** Store `gradient data` (from/to colors + angle)
**Resolution:** Add `gradientData text` column storing JSON string `{"from":"hsl(...)","to":"hsl(...)","angle":180}`. Text column with JSON avoids needing a jsonb dependency. Alternatively, store as `jsonb` if supported.

### Gap 3: Ambassador Fields Mismatch (AMB-02)
**Current:** Schema has `university text` + `motivation text`
**Required (AMB-02):** "community description" -- translation key is `formCommunity: "Describe your local community access"`
**Resolution:** The `motivation` field maps to "community description". Rename `motivation` to `community` and drop `university` (or keep both for flexibility). The blueprint form has `name`, `email`, `city`, `community` textarea fields.

### Gap 4: Agent Number Needs Sequence
**Current:** `agentNumber: integer("agent_number")` -- nullable, no sequence
**Required (REG-02):** Sequential SPEC-0001, SPEC-0002, no collisions
**Resolution:** Use PostgreSQL sequence. Options:
1. Use `integer("agent_number").notNull().default(sql\`nextval('spechack_agent_seq')\`)` with a custom sequence
2. Or assign in the Server Action using `SELECT COALESCE(MAX(agent_number), 0) + 1` within a transaction
**Recommended:** Option 1 (database sequence) is safer for concurrency. Create sequence in migration, reference with `DEFAULT nextval(...)`.

## Agent Number Strategy (REG-02)

**Requirement:** Sequential SPEC-0001, SPEC-0002, ... with no collisions.

**Approach: Database Sequence**
```sql
CREATE SEQUENCE IF NOT EXISTS "404_tech_found".spechack_agent_seq START 1;
```

Then in the Server Action:
```typescript
import { sql } from "drizzle-orm";

// Within transaction:
const [{ nextVal }] = await db.execute(
  sql`SELECT nextval('"404_tech_found".spechack_agent_seq') as "nextVal"`
);
const agentNumber = Number(nextVal);
// Format: `SPEC-${agentNumber.toString().padStart(4, "0")}`
```

**Why not MAX+1:** Under concurrent inserts, two requests could read the same MAX and produce duplicates. A sequence is atomic.

**Alternative: Drizzle serial column.** Drizzle's `serial()` column type auto-creates a sequence. However, we want `agent_number` to start at 1 and be formatted as SPEC-XXXX in the application layer, so using `serial` or a named sequence both work. The `serial` approach is simpler:
```typescript
agentNumber: serial("agent_number").notNull(),
```

## Duplicate Email Handling (REG-03)

**Requirement:** Duplicate email returns existing card data, no new record.

**Approach: INSERT ... ON CONFLICT**
```typescript
import { eq } from "drizzle-orm";

// Check existing first
const existing = await db.query.spechackParticipants.findFirst({
  where: eq(spechackParticipants.email, validated.email),
});

if (existing) {
  return {
    success: true,
    message: "existing",
    data: {
      agentNumber: `SPEC-${existing.agentNumber.toString().padStart(4, "0")}`,
      builderClass: existing.builderClass,
      gradient: JSON.parse(existing.gradientData),
    },
  };
}

// Insert new record
const [participant] = await db.insert(spechackParticipants)
  .values({ ... })
  .returning();
```

The `UNIQUE` constraint on `email` column (already in schema) is the safety net. The application-level check avoids wasting a sequence number on a conflict.

## Card Generation Logic (from Blueprint)

**Source:** `~/Projects/spechack-blueprint/src/lib/cardUtils.ts`

### Deterministic Hash Function
```typescript
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
```

### Gradient Generation (deterministic from name)
- 8 gradient combos (HSL color pairs)
- Angle: `120 + (hash % 120)` giving 120-240 degrees
- Returns `{ from, to, angle }`

### Builder Class Assignment
- 6 builder classes with bilingual descriptions
- Blueprint uses `getRandomBuilderClass()` for registration (random) and `getDeterministicBuilderClass()` for challenge pages
- **Decision needed:** CARD-04 says "randomly assigned" -- use `getRandomBuilderClass()` at registration time, store result in DB
- The deterministic version is for challenge page previews (Phase 6)

### Data to Store per REG-04
| Field | Source | Column |
|-------|--------|--------|
| name | Form input | `name` |
| email | Form input | `email` |
| city | Form input | `city` |
| track | Form toggle (virtual/hub) | `track` |
| agent number | DB sequence | `agent_number` |
| builder class | Random from 6 | `builder_class` (text, e.g. "The Architect") |
| gradient data | Deterministic from name | `gradient_data` (text/JSON) |
| locale | URL locale param | `locale` |
| created_at | DB default | `created_at` |

## SEO Metadata (SEO-01)

**Pattern:** Follow landing app's `generateMetadata` in layout.tsx exactly.

**Current state:** Spechack layout.tsx has a static `export const metadata` object with generic title/description. This must be replaced with `generateMetadata` function for locale-aware metadata.

**Required additions:**
1. Add `metadata` namespace to `messages/es.json` and `messages/en.json`
2. Create `src/lib/metadata/seo-config.ts` with SpecHack-specific constants
3. Replace static `metadata` export in layout.tsx with async `generateMetadata`

**Translation keys needed:**
```json
{
  "metadata": {
    "title": "SpecHack 2026 | Think First, Build with AI",
    "description": "10-day global hackathon...",
    "ogImageAlt": "SpecHack 2026 - Global Hackathon"
  }
}
```

**OG Image:** For SEO-01, a static OG image file in `public/` is sufficient (e.g., `public/og-image.png`). Dynamic OG images are Phase 6 (SEO-03).

## Common Pitfalls

### Pitfall 1: Zod v4 API Differences
**What goes wrong:** Zod v4 (installed: ^4.3.6) has a different API than Zod v3 which dominates tutorials
**Why it happens:** Most examples online use `z.object().safeParse()` from v3
**How to avoid:** The spechack app has Zod v4. Verify that `safeParse`, `flatten()`, and error formatting work the same. The landing app uses Zod (likely v3 via database package). Check both versions.
**Warning signs:** Type errors on `validation.error.flatten().fieldErrors`

### Pitfall 2: Schema Name Scoping
**What goes wrong:** SQL queries fail because schema name has spaces or special chars
**Why it happens:** Schema name derived from `NEXT_PUBLIC_PROJECT_NAME` via slugification
**How to avoid:** The schema is `pgSchema("404_tech_found")` -- all table references go through Drizzle's schema-aware queries. Sequences must also be created within this schema namespace.
**Warning signs:** `relation "spechack_participants" does not exist` errors

### Pitfall 3: Track Enum Values vs Form Values
**What goes wrong:** Form sends "virtual"/"hub" but DB enum expects "web"/"mobile"/etc.
**Why it happens:** Phase 1 schema was created with placeholder enum values
**How to avoid:** Fix the enum BEFORE building form logic. Migrate schema first.
**Warning signs:** Zod validation passes but DB insert fails

### Pitfall 4: Forgetting Hidden Locale Field in Forms
**What goes wrong:** Server Action receives no locale, insert fails
**Why it happens:** Locale comes from URL, not user input -- must be passed as hidden field
**How to avoid:** Add `<input type="hidden" name="locale" value={locale} />` in form, or extract locale from headers in Server Action
**Warning signs:** `locale` column NOT NULL constraint violation

### Pitfall 5: useActionState Initial State
**What goes wrong:** Component crashes on first render trying to read `state.errors`
**Why it happens:** Initial state is `null`, accessing `.errors` on null throws
**How to avoid:** Always use optional chaining: `state?.errors?.name`
**Warning signs:** "Cannot read properties of null" in console

## Code Examples

### Server Action Structure (registration)
```typescript
// src/app/[locale]/_actions/register.actions.ts
"use server";

import { z } from "zod";
import { db } from "@404tf/database";
import { spechackParticipants } from "@404tf/database/schema";
import { eq } from "drizzle-orm";
import { generateCardGradient, getRandomBuilderClass } from "@/lib/card-utils";

const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  city: z.string().min(1, "City required"),
  track: z.enum(["virtual", "hub"]),
  locale: z.enum(["es", "en"]),
});

export type RegisterFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: {
    agentNumber: string;
    name: string;
    builderClass: string;
    gradientData: string;
  };
} | null;

export async function submitRegistration(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const raw = Object.fromEntries(formData);
    const validation = registerSchema.safeParse(raw);

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { name, email, city, track, locale } = validation.data;

    // Check duplicate
    const existing = await db.query.spechackParticipants.findFirst({
      where: eq(spechackParticipants.email, email),
    });

    if (existing) {
      return {
        success: true,
        message: "existing",
        data: {
          agentNumber: `SPEC-${existing.agentNumber!.toString().padStart(4, "0")}`,
          name: existing.name,
          builderClass: existing.builderClass!,
          gradientData: existing.gradientData!,
        },
      };
    }

    // Generate card data
    const builderClass = getRandomBuilderClass();
    const gradient = generateCardGradient(name);
    const gradientData = JSON.stringify(gradient);

    // Insert
    const [participant] = await db
      .insert(spechackParticipants)
      .values({ name, email, city, track, builderClass: builderClass.name, gradientData, locale })
      .returning();

    return {
      success: true,
      message: "created",
      data: {
        agentNumber: `SPEC-${participant.agentNumber!.toString().padStart(4, "0")}`,
        name: participant.name,
        builderClass: participant.builderClass!,
        gradientData: participant.gradientData!,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Server error. Please try again." };
  }
}
```

### Client Form with useActionState
```typescript
// src/app/[locale]/_components/RegistrationForm.tsx
"use client";

import { useActionState, useState } from "react";
import { submitRegistration, type RegisterFormState } from "../_actions/register.actions";

type RegistrationFormProps = {
  locale: "es" | "en";
  translations: {
    formTitle: string;
    formName: string;
    formEmail: string;
    formCity: string;
    trackVirtual: string;
    trackHub: string;
    trackVirtualHelper: string;
    trackHubHelper: string;
    submit: string;
    formNote: string;
  };
};

export function RegistrationForm({ locale, translations }: RegistrationFormProps) {
  const [state, formAction, isPending] = useActionState(submitRegistration, null);
  const [track, setTrack] = useState<"virtual" | "hub">("virtual");

  if (state?.success) {
    // Phase 5 will replace this with CardReveal component
    return <div>Success! Agent {state.data?.agentNumber}</div>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="track" value={track} />
      {/* form fields... */}
      <button type="submit" disabled={isPending}>
        {isPending ? "..." : translations.submit}
      </button>
    </form>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useState` + `fetch` for forms | `useActionState` + Server Actions | React 19 / Next.js 14+ | Progressive enhancement, simpler code |
| API routes for mutations | `"use server"` functions | Next.js 14 stable | No API route files needed |
| `getServerSideProps` metadata | `generateMetadata` async function | Next.js 13+ App Router | Per-route metadata with locale support |

## Open Questions

1. **Zod v4 vs v3 Compatibility**
   - What we know: spechack has Zod ^4.3.6, landing app's database package also has Zod
   - What's unclear: Whether `safeParse().error.flatten().fieldErrors` has the same shape in Zod v4
   - Recommendation: Test with a simple validation before building all forms. If API differs, adapt error extraction.

2. **Schema Migration Strategy**
   - What we know: Tables were created in Phase 1 via `db:push`. They may or may not have data.
   - What's unclear: Whether we can do a clean `db:push` (destructive) or need proper migration
   - Recommendation: Since this is pre-launch with no production data, `bun run db:push` after schema edits is fine. If there's test data, back it up first.

3. **Sequence Creation in Drizzle**
   - What we know: Drizzle supports `serial()` column type which auto-creates a sequence
   - What's unclear: Whether `serial()` works correctly within a `pgSchema()` namespace
   - Recommendation: Use `serial("agent_number")` and test. If it fails within the schema namespace, create sequence manually via raw SQL in migration.

## Sources

### Primary (HIGH confidence)
- `apps/landing/src/app/[locale]/_actions/intent.actions.ts` -- Proven Server Action pattern in same monorepo
- `apps/landing/src/app/[locale]/layout.tsx` -- Proven generateMetadata pattern with next-intl
- `packages/database/src/schema.ts` -- Current DB schema (inspected directly)
- `packages/database/src/index.ts` -- Database client setup
- `~/Projects/spechack-blueprint/src/lib/cardUtils.ts` -- Card generation algorithms
- `~/Projects/spechack-blueprint/src/components/sections/Hero.tsx` -- Blueprint form handling
- `~/Projects/spechack-blueprint/src/components/sections/Judging.tsx` -- Blueprint ambassador form

### Secondary (MEDIUM confidence)
- `apps/spechack/src/app/[locale]/_components/Hero.tsx` -- Current placeholder form UI
- `apps/spechack/src/app/[locale]/_components/Hubs.tsx` -- Current ambassador CTA button

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using exact same libraries and patterns as landing app
- Architecture: HIGH - Server Action + useActionState pattern proven in landing app
- Schema gaps: HIGH - Direct inspection of schema vs requirements reveals clear mismatches
- Agent number strategy: MEDIUM - Sequence approach is standard PostgreSQL but untested within Drizzle pgSchema
- Pitfalls: HIGH - Based on direct code inspection and known gotchas

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable patterns, no fast-moving dependencies)
