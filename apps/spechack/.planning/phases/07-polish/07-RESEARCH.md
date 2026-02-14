# Phase 7 Research: Polish & Edge Cases

## Current State Analysis

### Form Validation
- Both forms use `useActionState` with Zod `.safeParse()`
- Field errors returned as `Record<string, string[]>` via `flatten().fieldErrors`
- Inline errors displayed: `state?.errors?.fieldName && <p class="text-red-400">`
- No on-blur validation (submit-only)
- No localized Zod error messages

### Error Handling
- Server actions wrap in try/catch, return `{ success: false, message: "error" }`
- Generic error state never displayed to user (silent failure)
- No error boundaries anywhere (loading.tsx, error.tsx absent)
- No toast/notification system

### Loading States
- Submit button shows "..." text when `isPending`
- No loading.tsx for any route
- No Suspense boundaries

### Name Display
- TradingCard: `truncate` CSS class (handles overflow visually)
- Canvas export: Fixed 40px font, no length check (may overflow)
- OG image: 72px font, no length check (may overflow)
- No max-length validation in Zod schema

### Dependencies
- No toast library installed
- Framer Motion available for animations
- lucide-react available for icons (Loader2 spinner)

## Key Files

| File | Role | Changes Needed |
|------|------|---------------|
| src/app/[locale]/_components/RegistrationForm.tsx | Registration form | Spinner, blur validation, toast |
| src/app/[locale]/_components/AmbassadorForm.tsx | Ambassador form | Spinner, blur validation, collapse animation |
| src/app/[locale]/_actions/register.actions.ts | Registration server action | Better error messages |
| src/app/[locale]/_actions/ambassador.actions.ts | Ambassador server action | Better error messages |
| src/app/[locale]/c/[name]/page.tsx | Challenge page | Invalid URL handling |
| src/app/[locale]/c/[name]/opengraph-image.tsx | OG image | Name truncation |
| src/app/[locale]/_components/TradingCard.tsx | Trading card visual | Already has truncate |
| src/lib/card-utils.client.ts | Canvas export | Name truncation |
| messages/es.json | Spanish translations | Error/loading/toast translations |
| messages/en.json | English translations | Error/loading/toast translations |

## Technical Decisions

1. **Toast**: Build lightweight custom toast (no external dep) — dark theme, auto-dismiss, positioned top-right
2. **Spinner**: Use lucide-react `Loader2` with `animate-spin` — already in deps
3. **Blur validation**: Partial Zod validation per-field using `.pick()` on schema
4. **Error boundary**: Next.js `error.tsx` convention for challenge page
5. **Loading skeleton**: Next.js `loading.tsx` convention for challenge page
6. **Name truncation**: Utility function `truncateName(name, maxLen=20)` shared across components
