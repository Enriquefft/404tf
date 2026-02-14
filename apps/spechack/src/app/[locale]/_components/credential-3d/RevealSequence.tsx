import type { CardData } from "@/lib/card-utils";
import { CredentialCard } from "./CredentialCard";
import { HoloRing } from "./HoloRing";
import { RadarPing } from "./RadarPing";
import type { RevealPhase } from "./useRevealState";

type RevealSequenceProps = {
	card: CardData;
	locale: "es" | "en";
	phase: RevealPhase;
	revealProgress: number;
};

export function RevealSequence({
	card,
	locale,
	phase,
	revealProgress,
}: RevealSequenceProps) {
	const showRadar = phase === "signal-lock";
	const showCard = phase !== "signal-lock";
	const showRing = phase === "materialize" || phase === "interactive";

	return (
		<group>
			<RadarPing color={card.gradient.from} visible={showRadar} />

			<CredentialCard
				card={card}
				locale={locale}
				phase={phase}
				revealProgress={revealProgress}
				visible={showCard}
			/>

			<HoloRing
				gradientFrom={card.gradient.from}
				gradientTo={card.gradient.to}
				visible={showRing}
			/>
		</group>
	);
}
