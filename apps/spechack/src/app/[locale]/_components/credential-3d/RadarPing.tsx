import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { Color } from "three";

type RadarPingProps = {
	color: string;
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

function PingRing({ delay, color }: { delay: number; color: Color }) {
	const meshRef = useRef<Mesh>(null);

	useFrame(({ clock }) => {
		if (!meshRef.current) return;
		const t = ((clock.getElapsedTime() - delay) % 1.5) / 1.5;
		if (t < 0) {
			meshRef.current.visible = false;
			return;
		}
		meshRef.current.visible = true;
		const scale = 1 + t * 3;
		meshRef.current.scale.set(scale, scale, 1);
		const mat = meshRef.current.material as unknown as {
			opacity: number;
		};
		mat.opacity = 1 - t;
	});

	return (
		<mesh ref={meshRef} rotation={[0, 0, 0]}>
			<ringGeometry args={[0.8, 0.85, 64]} />
			<meshBasicMaterial
				color={color}
				transparent
				opacity={1}
				depthWrite={false}
			/>
		</mesh>
	);
}

export function RadarPing({ color, visible }: RadarPingProps) {
	const c = parseHSLToColor(color);

	if (!visible) return null;

	return (
		<group>
			<PingRing delay={0} color={c} />
			<PingRing delay={0.5} color={c} />
			<PingRing delay={1.0} color={c} />
		</group>
	);
}
