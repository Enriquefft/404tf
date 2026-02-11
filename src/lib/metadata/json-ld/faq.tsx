import { getTranslations } from "next-intl/server";

/**
 * FAQPage JSON-LD schema with locale-aware Q&A
 * Async Server Component - fetches translations for FAQ content
 */
export async function FAQPageSchema({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: "faq" });

	const faqs = [
		{
			question: t("q1"),
			answer: t("a1"),
		},
		{
			question: t("q2"),
			answer: t("a2"),
		},
		{
			question: t("q3"),
			answer: t("a3"),
		},
		{
			question: t("q4"),
			answer: t("a4"),
		},
	];

	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
