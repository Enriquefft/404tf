import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeInSection, MotionDiv } from "./_components/animations";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("home");

	return (
		<main className="min-h-screen px-6 py-20">
			<FadeInSection>
				<h1 className="text-4xl font-bold text-primary">
					{t("title")}
				</h1>
				<p className="text-lg text-secondary mt-4">
					{t("subtitle")}
				</p>
			</FadeInSection>

			<FadeInSection className="mt-12">
				<p className="font-mono-accent text-muted-foreground">
					{t("mono")}
				</p>
			</FadeInSection>

			<FadeInSection className="mt-8">
				<MotionDiv
					className="bg-card p-6 rounded-lg border max-w-md"
					whileHover={{ scale: 1.02 }}
					transition={{ type: "spring", stiffness: 300 }}
				>
					<p className="text-card-foreground">
						{t("card")}
					</p>
				</MotionDiv>
			</FadeInSection>
		</main>
	);
}
