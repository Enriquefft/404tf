import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Programs() {
	const t = await getTranslations("landing.programs");

	const preincBenefits = [
		t("preincubation.b1"),
		t("preincubation.b2"),
		t("preincubation.b3"),
		t("preincubation.b4"),
	];

	const fellowshipBenefits = [
		t("fellowship.b1"),
		t("fellowship.b2"),
		t("fellowship.b3"),
		t("fellowship.b4"),
	];

	return (
		<section id="programs" className="py-24">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
					<p className="text-muted-foreground text-lg">{t("subtitle")}</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					{/* Pre-Incubation */}
					<div className="rounded-xl border border-border bg-card p-8">
						<div className="flex items-center gap-3 mb-4">
							<span className="text-xs font-bold bg-house-biotech/20 text-house-biotech px-2.5 py-1 rounded-full">
								{t("preincubation.badge")}
							</span>
							<span className="text-xs text-muted-foreground font-mono-accent">
								{t("preincubation.duration")}
							</span>
						</div>
						<h3 className="font-orbitron text-xl font-bold mb-6">Pre-Incubation</h3>
						<ul className="space-y-3 mb-8">
							{preincBenefits.map((b) => (
								<li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
									<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
									{b}
								</li>
							))}
						</ul>
						<a
							href="#intent-cta"
							className="block w-full gradient-purple text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity text-center"
						>
							{t("preincubation.cta")}
						</a>
					</div>

					{/* Fellowship */}
					<div className="rounded-xl border border-border bg-card p-8">
						<div className="flex items-center gap-3 mb-4">
							<span className="text-xs font-bold bg-primary/20 text-primary px-2.5 py-1 rounded-full">
								{t("fellowship.badge")}
							</span>
							<span className="text-xs text-muted-foreground font-mono-accent">
								{t("fellowship.duration")}
							</span>
						</div>
						<h3 className="font-orbitron text-xl font-bold mb-6">404 Founders Fellowship</h3>
						<ul className="space-y-3 mb-8">
							{fellowshipBenefits.map((b) => (
								<li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
									<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
									{b}
								</li>
							))}
						</ul>
						<button
							type="button"
							disabled
							className="w-full border border-border text-muted-foreground font-semibold py-3 rounded-lg opacity-50 cursor-not-allowed"
						>
							{t("fellowship.cta")}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
