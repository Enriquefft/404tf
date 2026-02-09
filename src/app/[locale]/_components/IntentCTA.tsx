import { getTranslations } from "next-intl/server";

const intents: { key: string; emoji: string }[] = [
	{ key: "build", emoji: "🔬" },
	{ key: "collaborate", emoji: "🤝" },
	{ key: "connect", emoji: "🌐" },
];

export async function IntentCTA() {
	const t = await getTranslations("landing.intent");

	return (
		<section id="intent-cta" className="py-24 gradient-purple relative overflow-hidden">
			{/* Decorative grid */}
			<div
				className="absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						"linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="container mx-auto px-4 relative z-10">
				<div className="text-center mb-12">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
						{t("headline")}
					</h2>
					<p className="text-primary-foreground/70 text-lg max-w-lg mx-auto">{t("subtitle")}</p>
				</div>

				{/* Intent cards */}
				<div className="flex flex-col md:flex-row gap-4 justify-center mb-10 max-w-3xl mx-auto">
					{intents.map((intent) => (
						<div
							key={intent.key}
							className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 p-6 text-center hover:bg-white/15 hover:border-white/40 transition-all duration-300"
						>
							<span className="text-3xl mb-3 block">{intent.emoji}</span>
							<span className="font-orbitron text-sm font-bold text-primary-foreground">
								{t(intent.key)}
							</span>
						</div>
					))}
				</div>

				{/* Contact */}
				<div className="text-center mt-12">
					<p className="text-white/50 text-sm">
						{t("questions")}{" "}
						<a
							href="mailto:hola@404techfound.com"
							className="text-white underline underline-offset-2 hover:text-white/80"
						>
							hola@404techfound.com
						</a>
					</p>
				</div>
			</div>
		</section>
	);
}
