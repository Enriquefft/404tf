"use client";

import type { CardData } from "@/lib/card-utils";
import { getCountryFlag, hashStr, truncateName } from "@/lib/card-utils";

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
	ctx.fillStyle = "hsl(240,5%,64%)";
	ctx.textAlign = "right";
	ctx.fillText(`#${card.agentNumber}`, W - 40, 60);

	// "AGENT" label
	ctx.textAlign = "left";
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,64%)";
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
	ctx.fillStyle = "hsl(240,5%,64%)";
	ctx.fillText(
		card.track === "hub" ? "HUB PARTICIPANT" : "VIRTUAL PARTICIPANT",
		40,
		260,
	);

	// Builder class label
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,64%)";
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
	ctx.fillStyle = "hsl(240,5%,56%)";
	ctx.fillText("SPECHACK 2026", 40, H - 40);

	return canvas;
}

const STAT_AXES = [
	"CREATIVITY",
	"SPEED",
	"DEBUGGING",
	"ARCHITECTURE",
	"RESILIENCE",
	"INNOVATION",
] as const;

const CLASS_STATS: Record<string, number[]> = {
	"The Architect": [0.6, 0.5, 0.7, 1.0, 0.8, 0.5],
	"The Prototyper": [0.8, 1.0, 0.4, 0.5, 0.6, 0.9],
	"The Full-Stack Maverick": [0.7, 0.7, 0.7, 0.8, 0.7, 0.7],
	"The Mad Scientist": [1.0, 0.6, 0.5, 0.4, 0.5, 1.0],
	"The Systems Thinker": [0.5, 0.4, 0.8, 1.0, 0.9, 0.6],
	"The Debug Whisperer": [0.5, 0.5, 1.0, 0.7, 0.9, 0.6],
};

function drawRadarChart(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
	stats: number[],
	color: string,
) {
	const n = stats.length;
	const angleStep = (Math.PI * 2) / n;

	// Draw grid rings
	ctx.save();
	ctx.strokeStyle = "hsl(240,5%,25%)";
	ctx.lineWidth = 1;
	for (let ring = 1; ring <= 3; ring++) {
		const r = (radius * ring) / 3;
		ctx.beginPath();
		for (let i = 0; i <= n; i++) {
			const angle = i * angleStep - Math.PI / 2;
			const x = cx + Math.cos(angle) * r;
			const y = cy + Math.sin(angle) * r;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	// Draw axes
	for (let i = 0; i < n; i++) {
		const angle = i * angleStep - Math.PI / 2;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
		ctx.stroke();
	}

	// Draw stat polygon
	ctx.beginPath();
	for (let i = 0; i <= n; i++) {
		const idx = i % n;
		const angle = idx * angleStep - Math.PI / 2;
		const r = radius * stats[idx];
		const x = cx + Math.cos(angle) * r;
		const y = cy + Math.sin(angle) * r;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.fillStyle = color;
	ctx.globalAlpha = 0.25;
	ctx.fill();
	ctx.globalAlpha = 0.8;
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.stroke();

	// Draw axis labels
	ctx.globalAlpha = 1;
	ctx.font = "13px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,64%)";
	ctx.textAlign = "center";
	for (let i = 0; i < n; i++) {
		const angle = i * angleStep - Math.PI / 2;
		const labelR = radius + 20;
		const x = cx + Math.cos(angle) * labelR;
		const y = cy + Math.sin(angle) * labelR + 4;
		ctx.fillText(STAT_AXES[i], x, y);
	}
	ctx.restore();
}

export function drawCardBackToCanvas(
	card: CardData,
	_locale: "es" | "en",
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

	// Subtle gradient overlay
	const grad = ctx.createLinearGradient(0, 0, W, H);
	grad.addColorStop(0, card.gradient.from);
	grad.addColorStop(1, card.gradient.to);
	ctx.globalAlpha = 0.08;
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, W, H);
	ctx.globalAlpha = 1;

	// "CLASSIFIED" header
	ctx.font = "bold 36px Orbitron, monospace";
	ctx.fillStyle = "hsl(0, 70%, 50%)";
	ctx.textAlign = "center";
	ctx.fillText("CLASSIFIED", W / 2, 60);

	// Horizontal rule
	ctx.strokeStyle = "hsl(0, 70%, 40%)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(40, 75);
	ctx.lineTo(W - 40, 75);
	ctx.stroke();

	// Redacted text lines
	ctx.textAlign = "left";
	const redactY = [110, 140, 170, 200];
	const redactWidths = [320, 250, 380, 200];
	for (let i = 0; i < redactY.length; i++) {
		// Deterministic widths from hash
		const seed = hashStr(card.name + i);
		const w = redactWidths[i] + (seed % 60) - 30;
		ctx.fillStyle = "hsl(240,5%,18%)";
		ctx.fillRect(40, redactY[i] - 14, w, 18);
	}

	// "DOSSIER" label
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,56%)";
	ctx.fillText(`DOSSIER: ${card.agentNumber}`, 40, 260);

	// Radar chart
	const stats = CLASS_STATS[card.builderClass.name] ?? [
		0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
	];
	drawRadarChart(ctx, W / 2, 420, 120, stats, card.gradient.from);

	// Builder class label below chart
	ctx.font = "bold 20px Orbitron, monospace";
	ctx.fillStyle = "hsl(240,5%,70%)";
	ctx.textAlign = "center";
	ctx.fillText(card.builderClass.name.toUpperCase(), W / 2, 580);

	// QR placeholder (stylized grid)
	const qrSize = 80;
	const qrX = W / 2 - qrSize / 2;
	const qrY = 620;
	const cellSize = qrSize / 10;
	let qrSeed = hashStr(card.name + "qr");
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			qrSeed = (qrSeed * 16807) % 2147483647;
			if (qrSeed % 3 !== 0) {
				ctx.fillStyle = "hsl(240,5%,30%)";
				ctx.fillRect(
					qrX + col * cellSize,
					qrY + row * cellSize,
					cellSize - 1,
					cellSize - 1,
				);
			}
		}
	}

	// Watermark
	ctx.font = "14px JetBrains Mono, monospace";
	ctx.fillStyle = "hsl(240,5%,25%)";
	ctx.textAlign = "center";
	ctx.fillText("SPECHACK 2026 // 404 TECH FOUND", W / 2, H - 30);

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
