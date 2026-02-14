import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/metadata/seo-config";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	return {
		metadataBase: new URL(SITE_URL),
		title: {
			template: `%s | ${SITE_NAME}`,
			default: t("title"),
		},
		description: t("description"),
		alternates: {
			canonical: `/${locale}`,
			languages: {
				es: "/es",
				en: "/en",
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			url: `/${locale}`,
			siteName: SITE_NAME,
			locale: locale === "es" ? "es_ES" : "en_US",
			type: "website",
			images: [
				{
					url: "/og-spechack.png",
					width: 1200,
					height: 630,
					alt: t("ogImageAlt"),
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
			images: ["/og-spechack.png"],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}
