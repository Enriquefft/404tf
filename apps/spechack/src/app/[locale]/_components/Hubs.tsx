import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";

export async function Hubs() {
	const t = await getTranslations("hubs");

	const cities = [
		{ name: "Lima", confirmed: true, x: 28, y: 65 },
		{ name: "São Paulo", confirmed: false, x: 38, y: 70 },
		{ name: "Mexico City", confirmed: false, x: 18, y: 48 },
		{ name: "Bogotá", confirmed: false, x: 26, y: 55 },
		{ name: "Buenos Aires", confirmed: false, x: 32, y: 82 },
		{ name: "Santiago", confirmed: false, x: 27, y: 76 },
	];

	return (
		<div id="hubs">
			<h3 className="font-orbitron font-bold text-2xl sm:text-3xl mb-4">
				{t("title")}
			</h3>

			<p className="font-mono text-xs text-secondary mb-6">{t("traction")}</p>

			{/* City map */}
			<div className="relative w-full aspect-[2/1] bg-card border border-border rounded-lg mb-8 overflow-hidden">
				<div className="absolute inset-0 blueprint-grid opacity-50" />
				{cities.map((city) => (
					<div
						key={city.name}
						className={`absolute flex items-center gap-1 ${
							city.confirmed ? "text-spec-green" : "text-muted-foreground/40"
						}`}
						style={{
							left: `${city.x}%`,
							top: `${city.y}%`,
							transform: "translate(-50%, -50%)",
						}}
					>
						<MapPin className="w-4 h-4" aria-hidden="true" />
						<span className="font-mono text-[10px] whitespace-nowrap">
							{city.name}
						</span>
					</div>
				))}
			</div>

			{/* Ambassador pitch */}
			<p className="text-muted-foreground text-sm mb-4">
				{t("ambassadorPitch")}
			</p>

			{/* Apply CTA button */}
			<button
				type="button"
				className="bg-primary text-primary-foreground font-mono px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
			>
				{t("applyCta")}
				{/* TODO: Phase 3 — expand form, Phase 4 — Server Action */}
			</button>
		</div>
	);
}
