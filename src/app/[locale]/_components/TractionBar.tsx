import { getTranslations } from "next-intl/server";

export async function TractionBar() {
	const t = await getTranslations("landing.traction");

	const stats = [
		{ value: "400+", label: t("community") },
		{ value: "250+", label: t("summit") },
		{ value: "92+", label: t("applicants") },
		{ value: "15", label: t("fellows") },
	];

	return (
		<section className="py-16 border-y border-border">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{stats.map((stat) => (
						<div key={stat.label} className="text-center">
							<p className="font-orbitron text-4xl md:text-5xl font-bold text-primary text-glow-purple">
								{stat.value}
							</p>
							<p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
