"use client";

import { Environment, Float, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useCallback, useState } from "react";
import type { CardData } from "@/lib/card-utils";
import { ParticleStream } from "./ParticleStream";
import { RevealSequence } from "./RevealSequence";
import { useRevealState } from "./useRevealState";

type AgentCredentialSceneProps = {
	card: CardData;
	locale: "es" | "en";
	onRevealComplete?: () => void;
};

function SceneContent({
	card,
	locale,
	onRevealComplete,
}: AgentCredentialSceneProps) {
	const { phase, revealProgress } = useRevealState(onRevealComplete);

	return (
		<>
			<ambientLight intensity={0.4} />
			<directionalLight position={[5, 5, 5]} intensity={0.6} />

			<Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
				<Physics gravity={[0, 0, 0]}>
					<RevealSequence
						card={card}
						locale={locale}
						phase={phase}
						revealProgress={revealProgress}
					/>
				</Physics>
			</Float>

			<ParticleStream
				gradientFrom={card.gradient.from}
				gradientTo={card.gradient.to}
			/>

			<Environment preset="night" />
		</>
	);
}

export function AgentCredentialScene({
	card,
	locale,
	onRevealComplete,
}: AgentCredentialSceneProps) {
	const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

	const handleIncline = useCallback(() => {
		setDpr([1, 1.5]);
	}, []);

	const handleDecline = useCallback(() => {
		setDpr([0.5, 1]);
	}, []);

	return (
		<Canvas
			dpr={dpr}
			gl={{ antialias: true, alpha: true }}
			camera={{ position: [0, 0, 6], fov: 45 }}
			style={{ background: "transparent" }}
		>
			<PerformanceMonitor onIncline={handleIncline} onDecline={handleDecline}>
				<Suspense fallback={null}>
					<SceneContent
						card={card}
						locale={locale}
						onRevealComplete={onRevealComplete}
					/>
				</Suspense>
			</PerformanceMonitor>
		</Canvas>
	);
}
