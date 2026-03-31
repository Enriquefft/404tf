import type { Locale } from "./translations";

export const LOCALES: readonly Locale[] = ["es", "en"] as const;
export const DEFAULT_LOCALE: Locale = "es";

/**
 * Locale-specific slug map for each page key.
 * Single source of truth for all route generation.
 */
export const ROUTE_MAP = {
	directory: { en: "directory", es: "directorio" },
	insights: { en: "insights", es: "perspectivas" },
	startups: { en: "startups", es: "startups" },
	about: { en: "about", es: "nosotros" },
	contact: { en: "contact", es: "contacto" },
} as const;

export type RouteKey = keyof typeof ROUTE_MAP;

/** Extract locale from a URL pathname. Falls back to default locale. */
export function getLocaleFromUrl(url: URL): Locale {
	const [, segment] = url.pathname.split("/");
	if (segment === "en" || segment === "es") {
		return segment;
	}
	return DEFAULT_LOCALE;
}

/** Generate a locale-prefixed path from a raw path segment. */
export function getLocalizedPath(path: string, locale: Locale): string {
	const clean = path.replace(/^\//, "");
	return `/${locale}/${clean}`;
}

/** Return the alternate locale (en <-> es). */
export function getAlternateLocale(locale: Locale): Locale {
	return locale === "es" ? "en" : "es";
}

/** Get the localized href for a given route key. */
export function getRouteHref(key: RouteKey, locale: Locale): string {
	return `/${locale}/${ROUTE_MAP[key][locale]}`;
}

/**
 * Given a pathname, return the equivalent path in the target locale.
 * Handles slug swaps using the route map.
 */
export function getAlternateLocalePath(pathname: string, targetLocale: Locale): string {
	const segments = pathname.split("/").filter(Boolean);
	const sourceLocale = segments[0] === "en" || segments[0] === "es" ? segments[0] : DEFAULT_LOCALE;

	// Root locale page
	if (segments.length <= 1) {
		return `/${targetLocale}`;
	}

	const slug = segments[1];

	// Try to find the matching route key by checking if the slug matches any locale variant
	for (const slugs of Object.values(ROUTE_MAP)) {
		if (slugs[sourceLocale] === slug) {
			return `/${targetLocale}/${slugs[targetLocale]}`;
		}
	}

	// Fallback: keep the same slug under the new locale
	return `/${targetLocale}/${segments.slice(1).join("/")}`;
}
