import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { Color } from "three";

type HoloRingProps = {
	gradientFrom: string;
	gradientTo: string;
	visible: boolean;
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

export function HoloRing({ gradientFrom, gradientTo, visible }: HoloRingProps) {
	const meshRef = useRef<Mesh>(null);
	const color = parseHSLToColor(gradientFrom);
	const emissive = parseHSLToColor(gradientTo);

	useFrame(({ clock }) => {
		if (!meshRef.current) return;
		meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
		meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
	});

	if (!visible) return null;

	return (
		<mesh ref={meshRef}>
			<torusGeometry args={[3, 0.02, 16, 100]} />
			<meshStandardMaterial
				color={color}
				emissive={emissive}
				emissiveIntensity={0.8}
				transparent
				opacity={0.6}
			/>
		</mesh>
	);
}
