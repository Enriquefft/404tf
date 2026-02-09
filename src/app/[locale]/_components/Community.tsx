import { getTranslations } from "next-intl/server";

const fellows = [
	{
		name: "Maria Chen",
		startup: "NeuroSpec AI",
		house: "AI",
		houseColor: "bg-house-ai",
		desc: "Computer vision for agricultural pest detection",
	},
	{
		name: "Carlos Medina",
		startup: "BioSynth Labs",
		house: "Biotech",
		houseColor: "bg-house-biotech",
		desc: "Synthetic biology for sustainable materials",
	},
	{
		name: "Ana Torres",
		startup: "MechaPrecision",
		house: "Hardware",
		houseColor: "bg-house-hardware",
		desc: "Low-cost medical robotics for rural clinics",
	},
];

export async function Community() {
	const t = await getTranslations("landing.community");

	return (
		<section id="community" className="py-24">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
					<p className="text-muted-foreground text-lg">{t("subtitle")}</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
					{fellows.map((fellow) => (
						<div
							key={fellow.name}
							className="rounded-xl border border-border bg-card p-6 text-center"
						>
							<div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
							<span
								className={`${fellow.houseColor} text-background text-[10px] font-bold px-2 py-0.5 rounded-full`}
							>
								{fellow.house}
							</span>
							<h4 className="font-orbitron text-sm font-bold mt-3">{fellow.name}</h4>
							<p className="text-xs text-primary font-medium mt-1">{fellow.startup}</p>
							<p className="text-xs text-muted-foreground mt-2">{fellow.desc}</p>
						</div>
					))}
				</div>

				<div className="text-center">
					<a
						href="#community"
						className="text-sm text-primary hover:underline underline-offset-4 transition-all"
					>
						{t("link")}
					</a>
				</div>
			</div>
		</section>
	);
}
