"use client";

import { motion } from "framer-motion";
import type { CardData } from "@/lib/card-utils";
import { BUILDER_CLASSES, generateCardGradient } from "@/lib/card-utils";
import { TradingCard } from "./TradingCard";

type TradingCardPreviewProps = {
	locale: "es" | "en";
	tagline: string;
};

const PREVIEW_CARDS: CardData[] = [
	{
		agentNumber: "SPEC-0042",
		name: "Alex Chen",
		city: "San Francisco",
		track: "hub",
		builderClass: BUILDER_CLASSES[0], // The Architect
		gradient: generateCardGradient("Alex Chen"),
	},
	{
		agentNumber: "SPEC-0108",
		name: "Sofia Rodriguez",
		city: "Buenos Aires",
		track: "virtual",
		builderClass: BUILDER_CLASSES[1], // The Prototyper
		gradient: generateCardGradient("Sofia Rodriguez"),
	},
	{
		agentNumber: "SPEC-0256",
		name: "Yuki Tanaka",
		city: "Tokyo",
		track: "hub",
		builderClass: BUILDER_CLASSES[3], // The Mad Scientist
		gradient: generateCardGradient("Yuki Tanaka"),
	},
	{
		agentNumber: "SPEC-0404",
		name: "Dev Patel",
		city: "Mumbai",
		track: "virtual",
		builderClass: BUILDER_CLASSES[5], // The Debug Whisperer
		gradient: generateCardGradient("Dev Patel"),
	},
];

const rotations = [-6, -2, 2, 6];

export function TradingCardPreview({
	locale,
	tagline,
}: TradingCardPreviewProps) {
	return (
		<div className="relative flex flex-col items-center gap-6">
			{/* Tagline */}
			<p className="text-center font-mono text-sm text-muted-foreground">
				{tagline}
			</p>

			{/* Fanned cards container */}
			<div className="relative flex items-center justify-center">
				{PREVIEW_CARDS.map((card, i) => (
					<motion.div
						key={card.agentNumber}
						className="w-[100px] sm:w-[120px] -ml-8 first:ml-0"
						style={{ rotate: rotations[i], zIndex: i }}
						whileHover={{ y: -10, scale: 1.05, zIndex: 10 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
					>
						<TradingCard card={card} locale={locale} />
					</motion.div>
				))}
			</div>
		</div>
	);
}
