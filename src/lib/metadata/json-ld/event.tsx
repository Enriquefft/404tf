import { SITE_NAME, SITE_URL } from "../seo-config";

/**
 * Event JSON-LD schema for SpecHack 2026
 * Server Component - renders structured data for the hackathon event
 */
export function EventSchema({ locale }: { locale: string }) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Event",
		name: "SpecHack 2026",
		startDate: "2026-06-19",
		endDate: "2026-06-28",
		eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
		eventStatus: "https://schema.org/EventScheduled",
		location: {
			"@type": "Place",
			name: "Lima, Peru",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Lima",
				addressCountry: "PE",
			},
		},
		description:
			locale === "es"
				? "Hackathon global de 10 días donde la spec es el producto. Escribe la especificación primero, construye con IA después."
				: "10-day global hackathon where the spec is the product. Write the spec first, build with AI second.",
		organizer: {
			"@type": "Organization",
			name: SITE_NAME,
			url: SITE_URL,
		},
	};

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
