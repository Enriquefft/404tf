"use client";

import type { CardData } from "@/lib/card-utils";
import { getCountryFlag } from "@/lib/card-utils";

type TradingCardProps = {
	card: CardData;
	locale: "es" | "en";
	className?: string;
};

export function TradingCard({
	card,
	locale,
	className = "",
}: TradingCardProps) {
	const flag = getCountryFlag(card.city || "virtual");
	const trackLabel = card.track === "virtual" ? "VIRTUAL 🌐" : "HUB 📍";

	return (
		<div
			className={`relative aspect-[3/4] rounded-xl overflow-hidden select-none ${className}`}
			style={{
				background: `linear-gradient(${card.gradient.angle}deg, ${card.gradient.from}15, ${card.gradient.to}15), hsl(240,10%,7%)`,
			}}
		>
			{/* Border */}
			<div className="absolute inset-[3px] rounded-xl border border-white/10" />

			{/* Gradient accent line */}
			<div
				className="absolute top-4 left-5 right-5 h-[2px] rounded-full"
				style={{
					background: `linear-gradient(90deg, ${card.gradient.from}, ${card.gradient.to})`,
				}}
			/>

			{/* Content */}
			<div className="relative h-full flex flex-col justify-between p-5 pt-8">
				{/* Top */}
				<div className="space-y-3">
					<p className="font-orbitron text-[10px] font-bold text-white/40 tracking-wider">
						SPECHACK
					</p>

					<p
						className="font-mono text-lg font-bold"
						style={{ color: card.gradient.from }}
					>
						{card.agentNumber}
					</p>

					<h3 className="font-orbitron text-xl font-extrabold text-white truncate">
						{card.name}
					</h3>

					<p className="font-mono text-xs text-white/60">
						{card.city || "Virtual"} {flag}
					</p>

					<span
						className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded"
						style={{
							color:
								card.track === "virtual"
									? "hsl(199,95%,60%)"
									: "hsl(142,71%,45%)",
							background:
								card.track === "virtual"
									? "hsl(199,95%,60%,0.1)"
									: "hsl(142,71%,45%,0.1)",
						}}
					>
						{trackLabel}
					</span>
				</div>

				{/* Separator */}
				<div className="w-full h-px bg-white/10 my-2" />

				{/* Builder class */}
				<div className="space-y-1">
					<p
						className="font-orbitron text-sm font-bold"
						style={{ color: card.gradient.to }}
					>
						{card.builderClass.name}
					</p>
					<p className="font-mono text-[10px] text-white/50 leading-relaxed">
						{card.builderClass.desc[locale]}
					</p>
				</div>

				{/* Bottom branding */}
				<p className="font-mono text-[8px] text-white/25 mt-auto pt-3">
					404 SPECHACK · JUNE 19-28, 2026
				</p>
			</div>
		</div>
	);
}
