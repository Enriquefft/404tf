import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Sponsors() {
	const t = await getTranslations("sponsors");

	const metrics = [
		{ value: "1,000+", labelKey: "metricDevs" },
		{ value: "5+", labelKey: "metricCities" },
		{ value: "10", labelKey: "metricDays" },
	];

	return (
		<section
			id="sponsors"
			className="py-24 sm:py-32 px-4 bg-card/50 border-t border-b border-primary/10"
		>
			<div className="max-w-4xl mx-auto text-center">
				{/* Title and subtitle */}
				<h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
					{t("title")}
				</h2>
				<p className="text-muted-foreground text-lg mb-12">{t("sub")}</p>

				{/* Metrics row */}
				<div className="flex justify-center gap-10 sm:gap-16 mb-10">
					{metrics.map(({ value, labelKey }) => (
						<div key={labelKey}>
							<div className="font-orbitron font-extrabold text-2xl sm:text-3xl text-primary">
								{value}
							</div>
							<div className="font-mono text-[11px] text-muted-foreground mt-1">
								{t(labelKey)}
							</div>
						</div>
					))}
				</div>

				{/* Value props */}
				<div className="grid sm:grid-cols-3 gap-6 mb-10">
					<p className="text-sm text-muted-foreground">{t("prop0")}</p>
					<p className="text-sm text-muted-foreground">{t("prop1")}</p>
					<p className="text-sm text-muted-foreground">{t("prop2")}</p>
				</div>

				{/* CTA buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
					<a
						href="#"
						className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-mono px-8 py-3 rounded-md hover:bg-accent transition-colors"
					>
						{t("deckCta")}
						<ExternalLink className="w-4 h-4" aria-hidden="true" />
					</a>
					<a
						href="#"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-primary text-primary-foreground font-mono px-8 py-3 rounded-md hover:bg-primary/90 transition-colors"
					>
						{t("callCta")}
					</a>
				</div>

				{/* NGO note */}
				<p className="font-mono text-[11px] text-muted-foreground max-w-lg mx-auto">
					{t("ngoNote")}
				</p>
			</div>
		</section>
	);
}
