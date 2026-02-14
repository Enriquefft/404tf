import { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { CardData } from "@/lib/card-utils";
import { drawCardBackToCanvas } from "@/lib/card-utils.client";
import { TEXTURE_HEIGHT, TEXTURE_WIDTH } from "./constants";

type CardBackTextureProps = {
	card: CardData;
	locale: "es" | "en";
};

export function useCardBackTexture({ card, locale }: CardBackTextureProps) {
	const texture = useMemo(() => {
		const canvas = drawCardBackToCanvas(card, locale);

		// Scale to texture resolution
		const scaled = document.createElement("canvas");
		scaled.width = TEXTURE_WIDTH;
		scaled.height = TEXTURE_HEIGHT;
		const ctx = scaled.getContext("2d")!;
		ctx.drawImage(canvas, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

		const tex = new CanvasTexture(scaled);
		tex.colorSpace = SRGBColorSpace;
		return tex;
	}, [card, locale]);

	return texture;
}
