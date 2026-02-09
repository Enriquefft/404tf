import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnouncementBanner } from "./_components/AnnouncementBanner";
import { FadeInSection } from "./_components/animations/FadeInSection";
import { Community } from "./_components/Community";
import { Events } from "./_components/Events";
import { Footer } from "./_components/Footer";
import { Hero } from "./_components/Hero";
import { Houses } from "./_components/Houses";
import { IntentCTA } from "./_components/IntentCTA";
import { Navbar } from "./_components/Navbar";
import { Partners } from "./_components/Partners";
import { Programs } from "./_components/Programs";
import { TractionBar } from "./_components/TractionBar";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	// Fetch translations for Client Components
	const navT = await getTranslations("landing.nav");
	const bannerT = await getTranslations("landing.banner");
	const tractionT = await getTranslations("landing.traction");
	const intentT = await getTranslations("landing.intent");

	return (
		<main className="min-h-screen bg-background text-foreground">
			<AnnouncementBanner
				translations={{
					text: bannerT("text"),
					link: bannerT("link"),
				}}
			/>
			<Navbar
				locale={locale as "es" | "en"}
				translations={{
					about: navT("about"),
					programs: navT("programs"),
					community: navT("community"),
					events: navT("events"),
					cta: navT("cta"),
				}}
			/>
			<Hero />
			<FadeInSection>
				<TractionBar
					translations={{
						community: tractionT("community"),
						summit: tractionT("summit"),
						applicants: tractionT("applicants"),
						fellows: tractionT("fellows"),
					}}
				/>
			</FadeInSection>
			<FadeInSection>
				<Houses />
			</FadeInSection>
			<FadeInSection>
				<Programs />
			</FadeInSection>
			<FadeInSection>
				<Events />
			</FadeInSection>
			<FadeInSection>
				<Community />
			</FadeInSection>
			<FadeInSection>
				<Partners />
			</FadeInSection>
			<FadeInSection>
				<IntentCTA
					locale={locale as "es" | "en"}
					translations={{
						headline: intentT("headline"),
						subtitle: intentT("subtitle"),
						build: intentT("build"),
						collaborate: intentT("collaborate"),
						connect: intentT("connect"),
						name: intentT("name"),
						email: intentT("email"),
						buildSubmit: intentT("buildSubmit"),
						collaborateSubmit: intentT("collaborateSubmit"),
						connectSubmit: intentT("connectSubmit"),
						buildHelper: intentT("buildHelper"),
						collaborateHelper: intentT("collaborateHelper"),
						connectHelper: intentT("connectHelper"),
						success: intentT("success"),
						questions: intentT("questions"),
						errorName: intentT("errorName"),
						errorEmail: intentT("errorEmail"),
						errorIntent: intentT("errorIntent"),
						errorGeneric: intentT("errorGeneric"),
						submitting: intentT("submitting"),
					}}
				/>
			</FadeInSection>
			<Footer />
		</main>
	);
}
