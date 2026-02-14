import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial, Texture } from "three";
import { Color } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-worldPos.xyz);
    gl_Position = projectionMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uRevealProgress;
  uniform vec3 uGradientFrom;
  uniform vec3 uGradientTo;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  vec3 hueShift(vec3 color, float shift) {
    float angle = shift * 6.28318;
    float s = sin(angle);
    float c = cos(angle);
    vec3 weights = vec3(0.299, 0.587, 0.114);
    float dot_val = dot(color, weights);
    vec3 result = vec3(dot_val) + vec3(
      c * (color.r - dot_val) + s * (0.0 - (color.g - dot_val) * 0.328 + (color.b - dot_val) * 1.25),
      c * (color.g - dot_val) + s * ((color.r - dot_val) * 0.0 - (color.b - dot_val) * 0.203),
      c * (color.b - dot_val) + s * ((color.r - dot_val) * -1.25 + (color.g - dot_val) * 1.05)
    );
    return clamp(result, 0.0, 1.0);
  }

  void main() {
    // Scan-line reveal from top to bottom
    float revealLine = 1.0 - vUv.y;
    if (revealLine > uRevealProgress) {
      discard;
    }

    // Scan-line glow near edge
    float edgeDist = uRevealProgress - revealLine;
    float scanGlow = smoothstep(0.0, 0.05, edgeDist) * (1.0 - smoothstep(0.0, 0.02, edgeDist));

    // Sample card texture
    vec4 texColor = texture2D(uTexture, vUv);

    // Fresnel-based iridescence
    float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    fresnel = pow(fresnel, 3.0);

    // Iridescent color from user gradient + rainbow shift
    vec3 iriColor = mix(uGradientFrom, uGradientTo, fresnel + sin(uTime * 0.5) * 0.3);
    iriColor = hueShift(iriColor, fresnel * 0.3 + uTime * 0.05);

    // Blend: base texture + iridescent overlay
    vec3 finalColor = texColor.rgb + iriColor * fresnel * 0.4;

    // Add scan-line glow
    vec3 glowColor = mix(uGradientFrom, uGradientTo, 0.5);
    finalColor += glowColor * scanGlow * 2.0;

    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

function parseHSL(hsl: string): [number, number, number] {
	const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
	if (!match) return [0, 0, 0.5];
	return [
		Number.parseInt(match[1]) / 360,
		Number.parseInt(match[2]) / 100,
		Number.parseInt(match[3]) / 100,
	];
}

function hslToColor(hsl: string): Color {
	const [h, s, l] = parseHSL(hsl);
	return new Color().setHSL(h, s, l);
}

const IridescentShaderMaterial = shaderMaterial(
	{
		uTexture: null,
		uTime: 0,
		uRevealProgress: 1,
		uGradientFrom: new Color(0.5, 0, 1),
		uGradientTo: new Color(0, 0.8, 1),
	},
	vertexShader,
	fragmentShader,
);

extend({ IridescentShaderMaterial });

// Augment JSX types
declare module "@react-three/fiber" {
	interface ThreeElements {
		iridescentShaderMaterial: {
			ref?: React.Ref<ShaderMaterial>;
			attach?: string;
			uTexture?: Texture | null;
			uTime?: number;
			uRevealProgress?: number;
			uGradientFrom?: Color;
			uGradientTo?: Color;
			transparent?: boolean;
		};
	}
}

type IridescentMaterialProps = {
	texture: Texture;
	gradientFrom: string;
	gradientTo: string;
	revealProgress: number;
};

export function IridescentMaterial({
	texture,
	gradientFrom,
	gradientTo,
	revealProgress,
}: IridescentMaterialProps) {
	const matRef = useRef<ShaderMaterial>(null);

	const fromColor = hslToColor(gradientFrom);
	const toColor = hslToColor(gradientTo);

	useFrame(({ clock }) => {
		if (matRef.current) {
			(matRef.current as unknown as Record<string, unknown>).uTime =
				clock.getElapsedTime();
		}
	});

	return (
		<iridescentShaderMaterial
			ref={matRef}
			attach="material"
			uTexture={texture}
			uRevealProgress={revealProgress}
			uGradientFrom={fromColor}
			uGradientTo={toColor}
			transparent
		/>
	);
}
