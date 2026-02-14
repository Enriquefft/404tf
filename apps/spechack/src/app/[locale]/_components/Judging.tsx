import { getTranslations } from "next-intl/server";
import { AnimatedProgressBar } from "./AnimatedProgressBar";

export async function Judging() {
	const t = await getTranslations("judging");

	const criteria = [
		{ labelKey: "criteria0Label", pct: 30 },
		{ labelKey: "criteria1Label", pct: 25 },
		{ labelKey: "criteria2Label", pct: 20 },
		{ labelKey: "criteria3Label", pct: 15 },
		{ labelKey: "criteria4Label", pct: 10 },
	];

	const prizes = [
		{ emoji: "🏆", labelKey: "prize0Label", descKey: "prize0Desc" },
		{ emoji: "📋", labelKey: "prize1Label", descKey: "prize1Desc" },
		{ emoji: "🧑‍💻", labelKey: "prize2Label", descKey: "prize2Desc" },
		{ emoji: "❤️", labelKey: "prize3Label", descKey: "prize3Desc" },
		{ emoji: "🏢", labelKey: "prize4Label", descKey: "prize4Desc" },
	];

	return (
		<div>
			<h3 className="font-orbitron font-bold text-2xl sm:text-3xl mb-10">
				{t("title")}
			</h3>

			{/* Criteria bars */}
			<div className="space-y-4 mb-12">
				{criteria.map(({ labelKey, pct }, i) => (
					<AnimatedProgressBar
						key={labelKey}
						label={t(labelKey)}
						pct={pct}
						delay={i * 0.1}
					/>
				))}
			</div>

			{/* Prizes */}
			<div className="space-y-6 mb-8">
				{prizes.map(({ emoji, labelKey, descKey }) => (
					<div key={labelKey} className="flex gap-3">
						<span className="text-2xl" aria-hidden="true">
							{emoji}
						</span>
						<div>
							<div className="font-orbitron font-bold text-sm mb-0.5">
								{t(labelKey)}
							</div>
							<div className="text-muted-foreground text-xs font-mono">
								{t(descKey)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Pool text */}
			<p className="font-mono text-sm text-muted-foreground mb-6">
				{t("poolText")}
			</p>

			{/* CTA link */}
			<a
				href="#register"
				className="inline-block bg-primary text-primary-foreground font-mono px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
			>
				{t("cta")}
			</a>
		</div>
	);
}
