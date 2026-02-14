import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeInSection } from "./_components/animations";
import { FAQ } from "./_components/FAQ";
import { Footer } from "./_components/Footer";
import { Hero } from "./_components/Hero";
import { Hubs } from "./_components/Hubs";
import { Judging } from "./_components/Judging";
import { Manifesto } from "./_components/Manifesto";
import { Navbar } from "./_components/Navbar";
import { Sponsors } from "./_components/Sponsors";
import { StickyRegisterButton } from "./_components/StickyRegisterButton";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const navT = await getTranslations("navbar");

	return (
		<>
			<Navbar
				locale={locale as "es" | "en"}
				translations={{
					challenge: navT("challenge"),
					howItWorks: navT("howItWorks"),
					prizes: navT("prizes"),
					hubs: navT("hubs"),
					faq: navT("faq"),
					sponsor: navT("sponsor"),
					register: navT("register"),
				}}
			/>
			<main>
				<FadeInSection>
					<Hero />
				</FadeInSection>
				<FadeInSection>
					<Manifesto />
				</FadeInSection>
				<section id="prizes" className="py-24 sm:py-32 px-4 blueprint-grid">
					<div className="max-w-6xl mx-auto">
						<div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
							<FadeInSection>
								<Judging />
							</FadeInSection>
							<FadeInSection>
								<Hubs />
							</FadeInSection>
						</div>
					</div>
				</section>
				<FadeInSection>
					<Sponsors />
				</FadeInSection>
				<FadeInSection>
					<FAQ />
				</FadeInSection>
			</main>
			<FadeInSection>
				<Footer />
			</FadeInSection>
			<StickyRegisterButton label={navT("register")} />
		</>
	);
}
