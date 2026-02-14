import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { CardData } from "@/lib/card-utils";
import { hashStr } from "@/lib/card-utils";
import { drawCardToCanvas } from "@/lib/card-utils.client";
import { GLITCH_FPS, TEXTURE_HEIGHT, TEXTURE_WIDTH } from "./constants";
import type { RevealPhase } from "./useRevealState";

type CardFaceTextureProps = {
	card: CardData;
	locale: "es" | "en";
	phase: RevealPhase;
};

function drawCircuitPattern(
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	seed: number,
) {
	ctx.save();
	ctx.globalAlpha = 0.12;
	ctx.strokeStyle = "hsl(199, 95%, 60%)";
	ctx.lineWidth = 1;

	// Deterministic pseudo-random from seed
	let s = seed;
	const rand = () => {
		s = (s * 16807 + 0) % 2147483647;
		return s / 2147483647;
	};

	const gridSize = 60;
	for (let x = 0; x < w; x += gridSize) {
		for (let y = 0; y < h; y += gridSize) {
			if (rand() > 0.3) continue;
			ctx.beginPath();
			const type = rand();
			if (type < 0.4) {
				// Horizontal line
				ctx.moveTo(x, y);
				ctx.lineTo(x + gridSize * (0.5 + rand() * 0.5), y);
			} else if (type < 0.7) {
				// L-shape
				ctx.moveTo(x, y);
				ctx.lineTo(x + gridSize * 0.5, y);
				ctx.lineTo(x + gridSize * 0.5, y + gridSize * 0.5);
			} else {
				// Small circle (node)
				ctx.arc(x, y, 3, 0, Math.PI * 2);
			}
			ctx.stroke();
		}
	}
	ctx.restore();
}

export function useCardFaceTexture({
	card,
	locale,
	phase,
}: CardFaceTextureProps) {
	const textureRef = useRef<CanvasTexture | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const lastGlitchTime = useRef(0);

	const texture = useMemo(() => {
		// Create a 2x resolution canvas
		const srcCanvas = drawCardToCanvas(card, locale);
		const canvas = document.createElement("canvas");
		canvas.width = TEXTURE_WIDTH;
		canvas.height = TEXTURE_HEIGHT;
		const ctx = canvas.getContext("2d")!;

		// Scale up the source canvas
		ctx.drawImage(srcCanvas, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

		// Add circuit pattern overlay
		drawCircuitPattern(ctx, TEXTURE_WIDTH, TEXTURE_HEIGHT, hashStr(card.name));

		const tex = new CanvasTexture(canvas);
		tex.colorSpace = SRGBColorSpace;
		textureRef.current = tex;
		canvasRef.current = canvas;
		return tex;
	}, [card, locale]);

	// Glitch effect during signal-lock phase
	useFrame(({ clock }) => {
		if (phase !== "signal-lock") return;
		const now = clock.getElapsedTime();
		if (now - lastGlitchTime.current < 1 / GLITCH_FPS) return;
		lastGlitchTime.current = now;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d")!;

		// Redraw base
		const srcCanvas = drawCardToCanvas(card, locale);
		ctx.drawImage(srcCanvas, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
		drawCircuitPattern(ctx, TEXTURE_WIDTH, TEXTURE_HEIGHT, hashStr(card.name));

		// Overwrite agent number with random glitch
		const randomNum = `SPEC-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
		ctx.fillStyle = "hsl(240,10%,7%)";
		ctx.fillRect(TEXTURE_WIDTH - 280, 10, 260, 80);
		ctx.font = "40px JetBrains Mono, monospace";
		ctx.fillStyle = "hsl(240,5%,50%)";
		ctx.textAlign = "right";
		ctx.fillText(`#${randomNum}`, TEXTURE_WIDTH - 80, 60 * 2);
		ctx.textAlign = "left";

		if (textureRef.current) {
			textureRef.current.needsUpdate = true;
		}
	});

	// Restore real number when leaving signal-lock
	useEffect(() => {
		if (phase !== "signal-lock" && canvasRef.current) {
			const ctx = canvasRef.current.getContext("2d")!;
			const srcCanvas = drawCardToCanvas(card, locale);
			ctx.drawImage(srcCanvas, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
			drawCircuitPattern(
				ctx,
				TEXTURE_WIDTH,
				TEXTURE_HEIGHT,
				hashStr(card.name),
			);
			if (textureRef.current) {
				textureRef.current.needsUpdate = true;
			}
		}
	}, [phase, card, locale]);

	return texture;
}
