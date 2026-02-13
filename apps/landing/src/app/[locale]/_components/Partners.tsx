import { getTranslations } from "next-intl/server";

const partnerNames = [
	"TechVentures",
	"Latam Labs",
	"ScienceCo",
	"InnovateX",
	"DeepFund",
	"BioForward",
	"NanoWorks",
	"FutureScale",
];

export async function Partners() {
	const t = await getTranslations("landing.partners");

	return (
		<section className="py-24">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold">{t("title")}</h2>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
					{partnerNames.map((name) => (
						<div
							key={name}
							className="border border-border rounded-lg p-6 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
						>
							<span className="font-orbitron text-xs text-muted-foreground">{name}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
