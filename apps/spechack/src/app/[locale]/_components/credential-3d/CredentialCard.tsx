import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { RigidBody } from "@react-three/rapier";
import { DoubleSide } from "three";
import type { CardData } from "@/lib/card-utils";
import { useCardBackTexture } from "./CardBackTexture";
import { useCardFaceTexture } from "./CardFaceTexture";
import {
	ANGULAR_DAMPING,
	CARD_DEPTH,
	CARD_HEIGHT,
	CARD_WIDTH,
	LINEAR_DAMPING,
} from "./constants";
import { IridescentMaterial } from "./IridescentMaterial";
import { useCardDrag } from "./useCardDrag";
import { useGyroscope } from "./useGyroscope";
import type { RevealPhase } from "./useRevealState";

type CredentialCardProps = {
	card: CardData;
	locale: "es" | "en";
	phase: RevealPhase;
	revealProgress: number;
	visible: boolean;
};

function parseHSLToHex(hsl: string): number {
	const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
	if (!match) return 0x8800ff;
	const h = Number.parseInt(match[1]) / 360;
	const s = Number.parseInt(match[2]) / 100;
	const l = Number.parseInt(match[3]) / 100;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h * 12) % 12;
		return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	};
	const r = Math.round(f(0) * 255);
	const g = Math.round(f(8) * 255);
	const b = Math.round(f(4) * 255);
	return (r << 16) | (g << 8) | b;
}

export function CredentialCard({
	card,
	locale,
	phase,
	revealProgress,
	visible,
}: CredentialCardProps) {
	const rigidBodyRef = useRef<RapierRigidBody>(null);
	const frontTexture = useCardFaceTexture({ card, locale, phase });
	const backTexture = useCardBackTexture({ card, locale });
	const { bind, isDragging } = useCardDrag(rigidBodyRef);
	const { orientation, enabled: gyroEnabled } = useGyroscope();

	const edgeColor = parseHSLToHex(card.gradient.from);
	const interactive = phase === "interactive";

	// Attach native DOM listeners when interactive
	useEffect(() => {
		if (!interactive) return;
		return bind();
	}, [interactive, bind]);

	// Apply gyroscope tilt when not dragging
	useFrame(() => {
		if (!gyroEnabled || isDragging.current) return;
		const rb = rigidBodyRef.current;
		if (!rb || !interactive) return;

		const { beta, gamma } = orientation.current;
		rb.applyTorqueImpulse({ x: beta * 0.01, y: gamma * 0.01, z: 0 }, true);
	});

	if (!visible) return null;

	return (
		<RigidBody
			ref={rigidBodyRef}
			type={interactive ? "dynamic" : "kinematicPosition"}
			angularDamping={ANGULAR_DAMPING}
			linearDamping={LINEAR_DAMPING}
			gravityScale={0}
			position={[0, 0, 0]}
		>
			<group>
				{/* Front face (+Z) */}
				<mesh position={[0, 0, CARD_DEPTH / 2 + 0.001]}>
					<planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
					<IridescentMaterial
						texture={frontTexture}
						gradientFrom={card.gradient.from}
						gradientTo={card.gradient.to}
						revealProgress={revealProgress}
					/>
				</mesh>

				{/* Back face (-Z) — flipped */}
				<mesh
					position={[0, 0, -(CARD_DEPTH / 2 + 0.001)]}
					rotation={[0, Math.PI, 0]}
				>
					<planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
					<IridescentMaterial
						texture={backTexture}
						gradientFrom={card.gradient.from}
						gradientTo={card.gradient.to}
						revealProgress={revealProgress}
					/>
				</mesh>

				{/* Card body (edges) */}
				<mesh>
					<boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} />
					<meshStandardMaterial
						color={edgeColor}
						emissive={edgeColor}
						emissiveIntensity={0.5}
						transparent
						opacity={0.8}
						side={DoubleSide}
					/>
				</mesh>
			</group>
		</RigidBody>
	);
}
