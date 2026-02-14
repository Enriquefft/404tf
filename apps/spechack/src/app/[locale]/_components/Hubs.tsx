import { MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AmbassadorForm } from "./AmbassadorForm";

export async function Hubs() {
	const t = await getTranslations("hubs");
	const locale = (await getLocale()) as "es" | "en";

	const cities = [
		{ name: "Lima", confirmed: true, x: 28, y: 65 },
		{ name: "Sao Paulo", confirmed: false, x: 38, y: 70 },
		{ name: "Mexico City", confirmed: false, x: 18, y: 48 },
		{ name: "Bogota", confirmed: false, x: 26, y: 55 },
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

			{/* Ambassador application form */}
			<AmbassadorForm
				locale={locale}
				translations={{
					applyCta: t("applyCta"),
					formName: t("formName"),
					formEmail: t("formEmail"),
					formCity: t("formCity"),
					formCommunity: t("formCommunity"),
					formSubmit: t("formSubmit"),
					formSuccess: t("formSuccess"),
				}}
			/>
		</div>
	);
}
