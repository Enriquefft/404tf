import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateDeterministicCard } from "@/lib/card-utils";
import { RegistrationForm } from "../../_components/RegistrationForm";
import { TradingCard } from "../../_components/TradingCard";

type Props = {
	params: Promise<{ locale: string; name: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale, name } = await params;
	const decodedName = decodeURIComponent(name);

	// Validate: name must contain at least one Unicode letter
	const isValidName = /\p{L}/u.test(decodedName.trim());
	if (!isValidName) {
		return { title: "SpecHack 2026" };
	}

	// Capitalize first letter for metadata
	const displayName =
		decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

	const t = await getTranslations({ locale, namespace: "challenge" });

	return {
		title: t("metaTitle", { name: displayName }),
		description: t("metaDescription", { name: displayName }),
		openGraph: {
			title: t("metaTitle", { name: displayName }),
			description: t("metaDescription", { name: displayName }),
			// opengraph-image.tsx in same directory will be auto-detected in Plan 06-03
		},
	};
}

export default async function ChallengePage({ params }: Props) {
	const { locale, name } = await params;
	setRequestLocale(locale);

	// Decode URL-encoded name
	const decodedName = decodeURIComponent(name);

	// Validate: name must contain at least one Unicode letter
	const isValidName = /\p{L}/u.test(decodedName.trim());
	if (!isValidName) {
		redirect(`/${locale}`);
	}

	const challengerCard = generateDeterministicCard(decodedName);

	// Get translations
	const t = await getTranslations("challenge");
	const heroT = await getTranslations("hero");
	const cardT = await getTranslations("cards");
	const errT = await getTranslations("errors");

	return (
		<main className="min-h-screen py-24 px-4 blueprint-grid">
			<div className="max-w-4xl mx-auto space-y-12">
				{/* Challenger card preview + challenge prompt */}
				<div className="flex flex-col items-center space-y-6">
					{/* Trading card preview */}
					<div className="w-[200px] sm:w-[240px]">
						<TradingCard card={challengerCard} locale={locale as "es" | "en"} />
					</div>

					{/* Challenge text */}
					<div className="text-center space-y-4 max-w-2xl">
						<h1 className="font-orbitron text-3xl sm:text-5xl font-extrabold text-primary">
							{t("title", { name: challengerCard.name })}
						</h1>
						<p className="text-lg sm:text-xl text-muted-foreground">
							{t("prompt")}
						</p>
					</div>
				</div>

				{/* Registration form */}
				<div className="max-w-xl mx-auto">
					<RegistrationForm
						locale={locale as "es" | "en"}
						translations={{
							formTitle: heroT("formTitle"),
							formName: heroT("formName"),
							formEmail: heroT("formEmail"),
							formCity: heroT("formCity"),
							trackVirtual: heroT("trackVirtual"),
							trackHub: heroT("trackHub"),
							trackVirtualHelper: heroT("trackVirtualHelper"),
							trackHubHelper: heroT("trackHubHelper"),
							submit: t("registerCta"), // "Accept Challenge" button text
							formNote: heroT("formNote"),
							successTitle: heroT("successTitle"),
							successSub: heroT("successSub"),
							serverError: errT("registration"),
						}}
						cardTranslations={{
							download: cardT("download"),
							shareX: cardT("shareX"),
							challenge: cardT("challenge"),
							challengeCopy: cardT("challengeCopy"),
							challengeWhatsApp: cardT("challengeWhatsApp"),
							challengeLinkedIn: cardT("challengeLinkedIn"),
							recruitMore: cardT("recruitMore"),
							tweetTemplate: cardT("tweetTemplate"),
						}}
					/>
				</div>
			</div>
		</main>
	);
}
