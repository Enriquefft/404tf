"use client";

import type { CardData } from "@/lib/card-utils";
import { getCountryFlag, truncateName } from "@/lib/card-utils";

export function drawCardToCanvas(
	card: CardData,
	locale: "es" | "en",
): HTMLCanvasElement {
	const W = 600;
	const H = 800;
	const canvas = document.createElement("canvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d")!;

	// Dark background
	ctx.fillStyle = "hsl(240,10%,7%)";
	ctx.fillRect(0, 0, W, H);

	// Gradient overlay at 15% opacity
	const grad = ctx.createLinearGradient(
		0,
		0,
		W * Math.cos((card.gradient.angle * Math.PI) / 180),
		H * Math.sin((card.gradient.angle * Math.PI) / 180),
	);
	grad.addColorStop(0, card.gradient.from);
	grad.addColorStop(1, card.gradient.to);
	ctx.globalAlpha = 0.15;
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, W, H);
	ctx.globalAlpha = 1;

	// Logo placeholder (top-left)
	ctx.font = "bold 28px Orbitron, monospace";
	ctx.fillStyle = "hsl(240,5%,90%)";
	ctx.fillText("404 TF", 40, 60);

	// Agent number (right-aligned, same baseline as logo)
	ctx.font = "20px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,50%)";
	ctx.textAlign = "right";
	ctx.fillText(`#${card.agentNumber}`, W - 40, 60);

	// "AGENT" label
	ctx.textAlign = "left";
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,50%)";
	ctx.fillText("AGENT", 40, 120);

	// Name
	ctx.font = "bold 40px Orbitron, monospace";
	ctx.fillStyle = "hsl(240,5%,90%)";
	ctx.fillText(truncateName(card.name).toUpperCase(), 40, 180);

	// City with flag
	const flag = getCountryFlag(card.city);
	ctx.font = "20px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,60%)";
	ctx.fillText(`${flag} ${card.city}`, 40, 220);

	// Track badge
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,50%)";
	ctx.fillText(
		card.track === "hub" ? "HUB PARTICIPANT" : "VIRTUAL PARTICIPANT",
		40,
		260,
	);

	// Builder class label
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,50%)";
	ctx.fillText("BUILDER CLASS", 40, 340);

	// Builder class name
	ctx.font = "bold 32px Orbitron, monospace";
	ctx.fillStyle = "hsl(240,5%,90%)";
	ctx.fillText(card.builderClass.name.toUpperCase(), 40, 390);

	// Builder class description (use locale)
	ctx.font = "18px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,60%)";
	ctx.fillText(card.builderClass.desc[locale], 40, 430);

	// Footer text
	ctx.font = "16px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,40%)";
	ctx.fillText("SPECHACK 2026", 40, H - 40);

	return canvas;
}

export async function downloadCard(
	card: CardData,
	locale: "es" | "en",
): Promise<void> {
	await document.fonts.ready;
	const canvas = drawCardToCanvas(card, locale);
	canvas.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `spechack-agent-${card.agentNumber}.png`;
		link.click();
		URL.revokeObjectURL(url);
	});
}

export function saveCardToStorage(data: CardData): void {
	localStorage.setItem("spechack_card", JSON.stringify(data));
}

export function loadCardFromStorage(): CardData | null {
	try {
		const stored = localStorage.getItem("spechack_card");
		if (!stored) return null;
		return JSON.parse(stored) as CardData;
	} catch {
		return null;
	}
}
