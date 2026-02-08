import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("landing");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
			{/* Hero section with gradient and glow effects */}
			<div className="text-center">
				<h1 className="font-orbitron text-6xl font-bold text-glow-purple mb-4">
					<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						{t("hero.title")}
					</span>
				</h1>
				<p className="text-2xl text-muted-foreground">{t("hero.subtitle")}</p>
			</div>

			{/* House color cards with glow borders */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
				<div className="glow-border-ai rounded-lg bg-card p-6 border border-[hsl(var(--house-ai))]">
					<h3
						className="font-orbitron text-xl font-bold mb-2"
						style={{ color: "hsl(var(--house-ai))" }}
					>
						AI House
					</h3>
					<p className="text-muted-foreground">Artificial Intelligence & Machine Learning</p>
				</div>

				<div className="glow-border-biotech rounded-lg bg-card p-6 border border-[hsl(var(--house-biotech))]">
					<h3
						className="font-orbitron text-xl font-bold mb-2"
						style={{ color: "hsl(var(--house-biotech))" }}
					>
						Biotech House
					</h3>
					<p className="text-muted-foreground">Biotechnology & Life Sciences</p>
				</div>

				<div className="glow-border-hardware rounded-lg bg-card p-6 border border-[hsl(var(--house-hardware))]">
					<h3
						className="font-orbitron text-xl font-bold mb-2"
						style={{ color: "hsl(var(--house-hardware))" }}
					>
						Hardware House
					</h3>
					<p className="text-muted-foreground">Hardware & Robotics</p>
				</div>
			</div>

			{/* Status text */}
			<p className="text-sm text-muted-foreground">{t("phase1.status")}</p>
		</div>
	);
}
