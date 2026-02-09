import { setRequestLocale } from "next-intl/server";
import { AnnouncementBanner } from "./_components/AnnouncementBanner";
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

	return (
		<main className="min-h-screen bg-background text-foreground">
			<AnnouncementBanner />
			<Navbar />
			<Hero />
			<TractionBar />
			<Houses />
			<Programs />
			<Events />
			<Community />
			<Partners />
			<IntentCTA />
			<Footer />
		</main>
	);
}
