// Cache tag registry — single source of truth so SSR pages and the
// /api/revalidate endpoint can't drift. Every page that sets a
// `Cache-Tag` response header must build the tag via this registry.
//
// Tags are stable, low-cardinality strings. Locale-scoped tags keep ES/EN
// invalidations independent; per-slug startup tags allow fine-grained
// profile refreshes; `startupAll` is the fan-out tag used when a change
// affects every startup profile (taxonomy rename, batch import).

export const CACHE_TAGS = {
	home: (locale: string) => `home-${locale}`,
	directory: "directory",
	insights: "insights",
	startup: (slug: string) => `startup-${slug}`,
	startupAll: "startup-all",
	contact: "contact-static",
} as const;

/** Join cache tags into the comma-separated string the CDN expects. */
export function joinCacheTags(tags: readonly string[]): string {
	return tags.join(",");
}
