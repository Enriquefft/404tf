# Testing Patterns

**Analysis Date:** 2026-02-13

## Test Framework

**Current Status:** No testing framework configured or tests present.

**Not Detected:**
- Test runner (Jest, Vitest, etc.)
- Test configuration files
- Test libraries or assertions
- Test coverage tooling
- CI/CD test pipeline

## Test File Organization

**Location:** Not applicable - no tests currently exist.

**Naming:** Would follow pattern: `{ComponentName}.test.tsx` or `{functionName}.test.ts`

**Structure:** Not established yet.

## Test Structure

Not applicable - no tests exist in the codebase.

## Mocking

Not applicable - no mocking framework configured.

## Fixtures and Factories

**Test Data Pattern (Reference):**
The codebase uses inline constant arrays for static data:
```typescript
const fellows = [
	{
		name: "Maria Chen",
		startup: "NeuroSpec AI",
		house: "AI",
		houseColor: "bg-house-ai",
		desc: "Computer vision for agricultural pest detection",
	},
	// ...
];
```

Similar pattern could be used for test fixtures.

**Zod Schemas for Validation:**
Server actions use Zod for runtime validation (`intent.actions.ts`):
```typescript
const intentSchema = z.object({
	intent: z.enum(["build", "collaborate", "connect"]),
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	locale: z.enum(["es", "en"]),
});
```

These schemas can be directly tested in unit tests.

## Coverage

**Requirements:** Not enforced - no testing infrastructure.

## Test Types

### Unit Testing Candidates

**Utilities:**
- `cn()` from `@/lib/utils.ts` - Utility for merging Tailwind classes
- Zod schemas in `intent.actions.ts` - Validation logic

**Hooks (Client):**
- `useLocalStorage()` from `@/hooks/useLocalStorage.ts`
  - Initialize with `initialValue`
  - Read from localStorage after hydration
  - Set value to both state and localStorage
  - Error handling for both read and write

- `useScrollDirection()` from `@/hooks/useScrollDirection.ts`
  - Track scroll direction changes
  - Debounce with 10px threshold to avoid jitter
  - Cleanup event listener on unmount

- `useBannerHeight()` from `@/hooks/useBannerHeight.ts`
  - Get height of banner element
  - Update on window resize

**Metadata Utilities:**
- SEO configuration in `@/lib/metadata/seo-config.ts`
- JSON-LD schema builders (Event, FAQ, Organization)

### Integration Testing Candidates

**Server Actions:**
- `submitIntent()` from `[locale]/_actions/intent.actions.ts`
  - Parse form data
  - Validate with Zod schema
  - Insert into database
  - Return appropriate FormState response
  - Handle database errors gracefully

**Database Operations:**
- Schema type inference with Drizzle ORM
- CRUD operations on `intentSubmissions` table

### E2E Testing Candidates (Not Implemented)

- Form submission flow (IntentCTA component → server action → database)
- Locale switching and i18n routing
- Navigation between sections
- Error boundary rendering on client errors

## Common Patterns

### Async Testing (Server Components)

Server components use async/await for data fetching:
```typescript
export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const navT = await getTranslations("landing.nav");
	// ...
}
```

Testing would need to mock `getTranslations` and `setRequestLocale` functions.

### Error Testing

Three patterns exist in codebase:

**Hook Error Handling:**
```typescript
try {
	const item = window.localStorage.getItem(key);
	if (item) setStoredValue(JSON.parse(item));
} catch (error) {
	console.error(`Error reading localStorage key "${key}":`, error);
}
```

Test would verify error is caught, logged, and state remains in fallback value.

**Server Action Error Handling:**
```typescript
try {
	const validation = intentSchema.safeParse(rawData);
	if (!validation.success) {
		const fieldErrors = validation.error.flatten().fieldErrors;
		return {
			success: false,
			message: "Validation failed",
			errors: { intent, name, email },
		};
	}
	await db.insert(intentSubmissions).values(validation.data);
	return { success: true, message: "success" };
} catch (error) {
	console.error("Database error in submitIntent:", error);
	return {
		success: false,
		message: "Database error. Please try again.",
	};
}
```

Test would verify:
- Invalid form data returns validation errors with field-level details
- Valid data triggers database insert
- Database errors return user-friendly message without exposing internal details

**Error Boundary:**
```typescript
useEffect(() => {
	console.error("Error boundary caught:", error);
}, [error]);
```

Would verify error is logged and UI renders recovery button.

## Client-Side Test Setup

For testing React components and hooks, recommended setup:

**Framework Options:**
- Vitest (recommended for Bun + TypeScript)
- Jest with Bun configuration

**Testing Library:**
- @testing-library/react for component testing
- @testing-library/user-event for user interactions

**Key Testing Patterns from Codebase:**

1. **State Management Testing:**
```typescript
// useLocalStorage should:
// - Return initialValue during SSR
// - Read from localStorage after hydration
// - Update both state and localStorage on setValue call
// - Handle JSON.parse errors gracefully
```

2. **Hook Dependency Testing:**
```typescript
// useScrollDirection should:
// - Return null initially
// - Update direction based on scroll position
// - Only update when scroll delta > 10px
// - Cleanup event listener on unmount
```

3. **Props Validation:**
All components with Props types should test that they:
- Accept defined props
- Render correctly with different prop combinations
- Handle optional props

## Server-Side Test Setup

For testing server components and server actions:

**Testing Library:**
- Node.js built-in test runner or Vitest
- Mock libraries: `vitest` or `jest` for mocking

**Test Patterns:**

1. **Zod Schema Validation:**
```typescript
// intentSchema should:
// - Accept valid intent values: "build", "collaborate", "connect"
// - Accept valid email format
// - Require name minimum 2 characters
// - Require all fields present
// - Return specific error messages for each field
```

2. **Server Action Testing:**
```typescript
// submitIntent should:
// - Parse FormData correctly
// - Validate all fields with Zod
// - Return field errors on validation failure
// - Insert into database on success
// - Return database error message on error
// - Not expose internal error details to client
```

3. **Database Integration:**
```typescript
// Would need:
// - Test database or mocked Drizzle client
// - Fixtures for IntentSubmission data
// - Transaction rollback for test isolation
```

---

*Testing analysis: 2026-02-13*
