import { SITE_NAME, SITE_URL, SOCIAL_LINKS } from "../seo-config";

/**
 * Organization JSON-LD schema for 404 Tech Found
 * Server Component - renders structured data for search engines
 */
export function OrganizationSchema() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}/logo.png`,
		sameAs: Object.values(SOCIAL_LINKS),
	};

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
