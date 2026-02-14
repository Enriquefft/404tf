export function buildTweetUrl(text: string): string {
	return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppUrl(text: string): string {
	return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildLinkedInUrl(url: string): string {
	return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function buildChallengeLink(
	name: string,
	origin: string,
	locale: "es" | "en",
): string {
	// Use first word only, lowercase, URL-encoded
	const slug = encodeURIComponent(name.split(" ")[0].toLowerCase());
	return `${origin}/${locale}/c/${slug}`;
}
