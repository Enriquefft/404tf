import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Points as PointsType } from "three";
import { Color } from "three";
import { PARTICLE_COUNT, PARTICLE_SPREAD } from "./constants";

type ParticleStreamProps = {
	gradientFrom: string;
	gradientTo: string;
};

function parseHSLToColor(hsl: string): Color {
	const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
	if (!match) return new Color(0.5, 0, 1);
	return new Color().setHSL(
		Number.parseInt(match[1]) / 360,
		Number.parseInt(match[2]) / 100,
		Number.parseInt(match[3]) / 100,
	);
}

export function ParticleStream({
	gradientFrom,
	gradientTo,
}: ParticleStreamProps) {
	const pointsRef = useRef<PointsType>(null);

	const positions = useMemo(() => {
		const arr = new Float32Array(PARTICLE_COUNT * 3);
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			arr[i * 3] = (Math.random() - 0.5) * PARTICLE_SPREAD;
			arr[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_SPREAD;
			arr[i * 3 + 2] = -2 - Math.random() * 4; // Behind card
		}
		return arr;
	}, []);

	const color = useMemo(() => parseHSLToColor(gradientFrom), [gradientFrom]);

	useFrame((_, delta) => {
		if (!pointsRef.current) return;
		const pos = pointsRef.current.geometry.attributes.position;
		if (!pos) return;
		const arr = pos.array as Float32Array;

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			// Drift upward
			arr[i * 3 + 1] += delta * 0.3;

			// Reset when above spread
			if (arr[i * 3 + 1] > PARTICLE_SPREAD / 2) {
				arr[i * 3 + 1] = -PARTICLE_SPREAD / 2;
				arr[i * 3] = (Math.random() - 0.5) * PARTICLE_SPREAD;
				arr[i * 3 + 2] = -2 - Math.random() * 4;
			}
		}
		pos.needsUpdate = true;
	});

	return (
		<Points ref={pointsRef} positions={positions} stride={3}>
			<PointMaterial
				color={color}
				size={0.03}
				transparent
				opacity={0.6}
				depthWrite={false}
				sizeAttenuation
			/>
		</Points>
	);
}
