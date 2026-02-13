# Coding Conventions

**Analysis Date:** 2026-02-13

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Logo.tsx`, `FadeInSection.tsx`, `IntentCTA.tsx`)
- Utilities: camelCase (e.g., `utils.ts`, `seo-config.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useLocalStorage.ts`, `useScrollDirection.ts`)
- Server actions: camelCase with `.actions.ts` suffix (e.g., `intent.actions.ts`)
- Config files: camelCase or kebab-case (e.g., `next.config.ts`, `biome.jsonc`)

**Functions:**
- Exported functions: PascalCase for components, camelCase for utilities
- Components: `export function ComponentName() {}`
- Utils: `export function utilityName() {}`
- Helper functions: camelCase, prefixed with context when needed (e.g., `getHelperText()`, `getSubmitText()`)

**Variables:**
- State: camelCase (e.g., `scrollDirection`, `selectedIntent`, `storedValue`)
- State setters: `set` + PascalCase (e.g., `setScrollDirection`, `setSelectedIntent`, `setStoredValue`)
- Constants: UPPER_SNAKE_CASE or camelCase depending on scope
  - File-scoped constants: camelCase (e.g., `intents`, `fellows`)
  - Global config constants: UPPER_SNAKE_CASE (e.g., `SITE_URL`, `CONTACT_EMAIL`, `SOCIAL_LINKS`)

**Types:**
- Component props types: `{ComponentName}Props` (e.g., `LogoProps`, `IntentCTAProps`, `FadeInSectionProps`)
- Generic types: PascalCase (e.g., `FormState`, `IntentSubmission`)
- Enums: PascalCase (e.g., `landing_intent`, `landing_locale` in Drizzle schema)

**Directories:**
- Route folders: kebab-case or `[brackets]` for dynamic segments (e.g., `[locale]`, `_components`, `_actions`)
- Utility folders: kebab-case (e.g., `lib/`, `hooks/`, `i18n/`, `styles/`)
- Private folders: leading underscore (e.g., `_components/`, `_actions/`)

## Code Style

**Formatting:**
- Tool: Biome (`@biomejs/biome`)
- Indent: Tabs (configured as `indentStyle: "tab"`)
- Line width: 100 characters
- Quotes: Double quotes for JavaScript (configured as `quoteStyle: "double"`)
- CSS modules: Enabled (`cssModules: true`)

**Linting:**
- Tool: Biome with domain rules for Next.js and React
- Config location: `/home/hybridz/Projects/404tf/packages/config/biome.jsonc`
- Key disabled rules:
  - `useUniqueElementIds`: Disabled (anchor navigation IDs cause false positives)
  - `useLiteralKeys`: Disabled in complexity rules
- Special overrides for Next.js files (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `proxy.ts`):
  - `noDefaultExport`: Disabled (required by Next.js)
  - `useComponentExportOnlyModules`: Error-level with allowlist for `metadata`, `generateMetadata`, `generateStaticParams`, `config`

**Biome Ignore Comments:**
Format: `// biome-ignore lint/{rule-name}: {reason}`
Examples from codebase:
- `// biome-ignore lint/a11y/useValidAnchor: Anchor navigates to top of page via #`
- `// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML`
- `// biome-ignore lint/style/useComponentExportOnlyModules: Next.js opengraph-image convention requires exporting metadata`

## Import Organization

**Order:**
1. React and Next.js imports
2. Third-party library imports
3. Workspace package imports (e.g., `@404tf/database`, `@404tf/config`)
4. Local imports from `@/` alias

**Path Aliases:**
- `@/` → `./src/` (configured in `tsconfig.json`)
- All imports use absolute paths with `@/` prefix
- Examples:
  - `@/lib/utils` → Utility functions
  - `@/lib/metadata/seo-config` → Configuration objects
  - `@/lib/analytics/*` → Analytics components and hooks
  - `@/hooks/*` → Custom React hooks
  - `@/i18n/*` → Internationalization utilities
  - `@/app/*` → App router files and layouts
  - `@/assets/*` → Static assets

## Error Handling

**Patterns:**
- Server actions use try-catch with Zod validation
- Validation errors returned as structured `FormState` object with field-level errors
- Database errors caught and returned as user-friendly message
- Client-side: Try-catch blocks log errors to console with context

**Example patterns:**

Server action validation (from `intent.actions.ts`):
```typescript
const validation = intentSchema.safeParse(rawData);
if (!validation.success) {
	const fieldErrors = validation.error.flatten().fieldErrors;
	return {
		success: false,
		message: "Validation failed",
		errors: { intent, name, email },
	};
}
```

Hook error handling (from `useLocalStorage.ts`):
```typescript
try {
	const item = window.localStorage.getItem(key);
	if (item) setStoredValue(JSON.parse(item));
} catch (error) {
	console.error(`Error reading localStorage key "${key}":`, error);
}
```

Error boundary (from `[locale]/error.tsx`):
```typescript
useEffect(() => {
	console.error("Error boundary caught:", error);
}, [error]);
```

## Logging

**Framework:** `console` object (no logger library)

**Patterns:**
- `console.error()` for errors in hooks, server actions, and error boundaries
- Messages include context: operation name, key/identifier, or user-facing description
- Format: `console.error("Context description:", error)` or `console.error(\`Message with ${variable}\`)`
- Examples from codebase:
  - `console.error(\`Error reading localStorage key "${key}":\`, error)`
  - `console.error(\`Error setting localStorage key "${key}":\`, error)`
  - `console.error("Error boundary caught:", error)`
  - `console.error("Database error in submitIntent:", error)`

## Comments

**When to Comment:**
- JSDoc comments for exported functions, hooks, and utility functions
- Inline comments for non-obvious logic or important guards/checks
- Comments explaining why (not what) for complex conditionals

**JSDoc/TSDoc:**
- Used for public functions and hooks
- Includes parameter descriptions and return type documentation
- Example from `useLocalStorage.ts`:
```typescript
/**
 * SSR-safe hook to persist state in localStorage
 *
 * Keys should use the `404tf:` namespace prefix, e.g.:
 * - `404tf:announcement-spechack:dismissed`
 * - `404tf:theme`
 *
 * @param key - localStorage key (should be namespaced with "404tf:")
 * @param initialValue - default value used during SSR and before localStorage is read
 * @returns tuple of [storedValue, setValue]
 */
```

- Inline comments for guards and non-obvious checks:
```typescript
// Guard: only capture if PostHog is configured
if (posthog) {
	posthog.capture("web_vitals", { ... });
}

// Only update if scroll delta > 10px to avoid jitter
if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
	setScrollDirection(direction);
}

// Read from localStorage AFTER hydration (client-only)
useEffect(() => { ... }, [key]);
```

## Function Design

**Size:** Functions kept concise and focused. Helper functions for conditional logic in render paths.

**Parameters:**
- Server components: `{ params }: Props` with typed `params` object (async when needed)
- Client components: Props object destructuring with type definition
- Hooks: Single responsibility - return minimal data or handler function

**Return Values:**
- Components: JSX elements or null
- Hooks: Values or state setters
- Server actions: Structured response objects (`FormState` pattern)
- Utilities: Typed return values matching their purpose

**Async handling:**
- Server components: Async by default, use `await` for data fetching and i18n
- Client components: Use `useEffect` for side effects, `useActionState` for server actions

## Module Design

**Exports:**
- Named exports for functions, types, and constants: `export function`, `export type`, `export const`
- No default exports except for Next.js special files (pages, layouts, error boundaries)
- Component files typically export single component and its Props type

**Barrel Files:**
- Not used in current codebase
- Imports are direct from specific files (e.g., `@/lib/utils` not `@/lib`)

**Props types:**
- Defined inline in component files
- Placed before the component function
- Destructured in function parameters
- Include optional properties with `?` modifier

Example pattern from `Logo.tsx`:
```typescript
type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps) {
	// ...
}
```

## TypeScript Configuration

**Key settings:**
- Strict mode: `true`
- Target: `ESNext`
- Module resolution: `bundler` (Node.js compatible)
- Source maps: Implied by Next.js
- No emit: `true` (Next.js handles compilation)
- Isolated modules: `true` (supports Turbopack)

**JSX handling:**
- `jsx: "preserve"` - Next.js handles JSX transformation

---

*Convention analysis: 2026-02-13*
