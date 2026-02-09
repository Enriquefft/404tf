import { Calendar, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Events() {
	const t = await getTranslations("landing.events");

	return (
		<section id="events" className="py-24">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
					<p className="text-muted-foreground text-lg">{t("subtitle")}</p>
				</div>

				{/* Featured: SpecHack */}
				<div
					className="rounded-xl border border-primary/30 bg-primary/5 p-8 md:p-12 mb-8 glow-border-ai max-w-4xl mx-auto"
					style={{ boxShadow: "0 0 30px hsl(262 85% 50% / 0.15)" }}
				>
					<span className="font-mono-accent text-xs text-primary tracking-widest">
						FEATURED EVENT
					</span>
					<h3 className="font-orbitron text-2xl md:text-3xl font-bold mt-3 mb-2">404 SpecHack</h3>
					<p className="text-sm italic text-muted-foreground mb-4">{t("spechack.tagline")}</p>
					<div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6">
						<span className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5" /> Jun 19-28, 2026
						</span>
						<span className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" /> Global · Hybrid
						</span>
					</div>
					<p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-2xl">
						{t("spechack.desc")}
					</p>
					<div className="flex flex-wrap gap-4">
						<a
							href="https://spechack.404tf.com"
							target="_blank"
							rel="noopener"
							className="gradient-purple text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm"
						>
							{t("spechack.register")}
						</a>
						<a
							href="https://spechack.404tf.com"
							target="_blank"
							rel="noopener"
							className="border border-border text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-muted transition-colors text-sm"
						>
							{t("spechack.ambassador")}
						</a>
					</div>
				</div>

				{/* Secondary events */}
				<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
					{[
						{ name: "Deeptech Summit 2026", location: "Lima, Perú", date: "SEP 2026" },
						{ name: "International Demo Day", location: "Virtual", date: "DEC 2026" },
					].map((event) => (
						<div key={event.name} className="rounded-xl border border-border bg-card p-6">
							<h4 className="font-orbitron text-lg font-bold mb-3">{event.name}</h4>
							<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<MapPin className="h-3.5 w-3.5" /> {event.location}
								</span>
								<span className="flex items-center gap-1">
									<Calendar className="h-3.5 w-3.5" /> {event.date}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
