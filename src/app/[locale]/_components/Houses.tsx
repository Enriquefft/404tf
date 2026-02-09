import { Cog, Cpu, Dna } from "lucide-react";
import { getTranslations } from "next-intl/server";

const houses = [
	{
		key: "ai",
		icon: Cpu,
		tagline: '"Code that thinks."',
		colorClass: "text-house-ai border-house-ai/30",
		glowClass: "glow-border-ai",
		bgClass: "bg-house-ai/5",
	},
	{
		key: "biotech",
		icon: Dna,
		tagline: '"Evolving life, engineering futures."',
		colorClass: "text-house-biotech border-house-biotech/30",
		glowClass: "glow-border-biotech",
		bgClass: "bg-house-biotech/5",
	},
	{
		key: "hardware",
		icon: Cog,
		tagline: '"Atoms to products."',
		colorClass: "text-house-hardware border-house-hardware/30",
		glowClass: "glow-border-hardware",
		bgClass: "bg-house-hardware/5",
	},
];

export async function Houses() {
	const t = await getTranslations("landing.houses");

	return (
		<section id="houses" className="py-24">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
					<p className="text-muted-foreground text-lg max-w-md mx-auto">{t("subtitle")}</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{houses.map((house) => {
						const Icon = house.icon;
						return (
							<div
								key={house.key}
								className={`rounded-xl border p-8 ${house.colorClass} ${house.glowClass} ${house.bgClass} hover:scale-[1.02] transition-transform`}
							>
								<Icon className="h-10 w-10 mb-4" />
								<p className="font-mono-accent text-sm mb-3 opacity-80">{house.tagline}</p>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t(`${house.key}.desc`)}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
