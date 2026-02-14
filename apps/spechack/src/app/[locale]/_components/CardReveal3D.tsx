"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2, Swords } from "lucide-react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Component, useState } from "react";
import type { CardData } from "@/lib/card-utils";
import { downloadCard } from "@/lib/card-utils.client";
import {
	buildChallengeLink,
	buildLinkedInUrl,
	buildTweetUrl,
	buildWhatsAppUrl,
} from "@/lib/share-utils";
import { CardReveal } from "./CardReveal";

const AgentCredentialScene = dynamic(
	() =>
		import("./credential-3d/AgentCredentialScene").then((mod) => ({
			default: mod.AgentCredentialScene,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center aspect-[3/4] max-w-[400px] mx-auto">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		),
	},
);

type CardReveal3DProps = {
	card: CardData;
	locale: "es" | "en";
	translations: {
		download: string;
		shareX: string;
		challenge: string;
		challengeCopy: string;
		challengeWhatsApp: string;
		challengeLinkedIn: string;
		recruitMore: string;
		tweetTemplate: string;
	};
};

// Error boundary that falls back to 2D CardReveal
type ErrorBoundaryProps = {
	fallback: ReactNode;
	children: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
};

class WebGLErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}

export function CardReveal3D({
	card,
	locale,
	translations,
}: CardReveal3DProps) {
	const [revealDone, setRevealDone] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showShare, setShowShare] = useState(false);

	const handleShareX = () => {
		const challengeLink = buildChallengeLink(
			card.name,
			window.location.origin,
			locale,
		);
		const tweetText = translations.tweetTemplate
			.replace("%agent%", card.agentNumber)
			.replace("%cls%", card.builderClass.name)
			.replace("%link%", challengeLink);
		window.open(buildTweetUrl(tweetText), "_blank");
	};

	const handleCopy = async () => {
		const challengeLink = buildChallengeLink(
			card.name,
			window.location.origin,
			locale,
		);
		await navigator.clipboard.writeText(challengeLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleWhatsApp = () => {
		const challengeLink = buildChallengeLink(
			card.name,
			window.location.origin,
			locale,
		);
		const text = `Join me at SpecHack 2026! ${challengeLink}`;
		window.open(buildWhatsAppUrl(text), "_blank");
	};

	const handleLinkedIn = () => {
		const challengeLink = buildChallengeLink(
			card.name,
			window.location.origin,
			locale,
		);
		window.open(buildLinkedInUrl(challengeLink), "_blank");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-6"
		>
			{/* 3D Card Scene */}
			<div className="aspect-[3/4] max-w-[400px] mx-auto relative">
				<WebGLErrorBoundary
					fallback={
						<CardReveal
							card={card}
							locale={locale}
							translations={translations}
						/>
					}
				>
					<AgentCredentialScene
						card={card}
						locale={locale}
						onRevealComplete={() => setRevealDone(true)}
					/>
				</WebGLErrorBoundary>
			</div>

			{/* Action buttons - fade in after reveal */}
			<AnimatePresence>
				{revealDone && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col gap-3"
					>
						{/* Download button */}
						<button
							type="button"
							onClick={() => downloadCard(card, locale)}
							className="flex items-center justify-center gap-2 w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm hover:bg-muted/80 transition-colors"
						>
							<Download className="w-4 h-4" />
							{translations.download}
						</button>

						{/* Share on X button */}
						<button
							type="button"
							onClick={handleShareX}
							className="flex items-center justify-center gap-2 w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm hover:bg-muted/80 transition-colors"
						>
							<Share2 className="w-4 h-4" />
							{translations.shareX}
						</button>

						{/* Challenge button */}
						<button
							type="button"
							onClick={() => setShowShare(!showShare)}
							className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 font-mono text-sm hover:opacity-90 transition-opacity"
						>
							<Swords className="w-4 h-4" />
							{translations.challenge}
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Share panel */}
			<AnimatePresence>
				{showShare && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="bg-card border border-border rounded-lg p-4 space-y-3">
							<p className="font-mono text-xs text-muted-foreground">
								{translations.recruitMore}
							</p>

							{/* Copy link button */}
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center justify-center gap-2 w-full bg-muted border border-border rounded-md px-4 py-2 font-mono text-xs hover:bg-muted/80 transition-colors"
							>
								{copied ? (
									<>
										<Check className="w-3.5 h-3.5" />
										Copied!
									</>
								) : (
									<>
										<Copy className="w-3.5 h-3.5" />
										{translations.challengeCopy}
									</>
								)}
							</button>

							{/* WhatsApp button */}
							<button
								type="button"
								onClick={handleWhatsApp}
								className="flex items-center justify-center gap-2 w-full bg-muted border border-border rounded-md px-4 py-2 font-mono text-xs hover:bg-muted/80 transition-colors"
							>
								{translations.challengeWhatsApp}
							</button>

							{/* LinkedIn button */}
							<button
								type="button"
								onClick={handleLinkedIn}
								className="flex items-center justify-center gap-2 w-full bg-muted border border-border rounded-md px-4 py-2 font-mono text-xs hover:bg-muted/80 transition-colors"
							>
								{translations.challengeLinkedIn}
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
