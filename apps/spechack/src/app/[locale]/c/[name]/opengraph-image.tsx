import { ImageResponse } from "next/og";
import { generateDeterministicCard, truncateName } from "@/lib/card-utils";

export const runtime = "nodejs";
export const alt = "SpecHack Challenge Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
	params: Promise<{ locale: string; name: string }>;
};

export default async function Image({ params }: Props) {
	const { locale, name } = await params;
	const decodedName = decodeURIComponent(name);
	const card = generateDeterministicCard(decodedName);

	// Load custom fonts (must use fetch with absolute URLs in Edge runtime)
	const [orbitronBold, jetbrainsMonoReg] = await Promise.all([
		fetch(
			new URL("../../../../../public/fonts/Orbitron-Bold.ttf", import.meta.url),
		).then((res) => res.arrayBuffer()),
		fetch(
			new URL(
				"../../../../../public/fonts/JetBrainsMono-Regular.ttf",
				import.meta.url,
			),
		).then((res) => res.arrayBuffer()),
	]);

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				background: `linear-gradient(${card.gradient.angle}deg, ${card.gradient.from}20, ${card.gradient.to}20), hsl(240,10%,7%)`,
				padding: 60,
				flexDirection: "column",
				justifyContent: "space-between",
			}}
		>
			{/* Top section: Logo + Name + Agent # */}
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						fontSize: 28,
						fontFamily: "JetBrains Mono",
						color: "hsl(240,5%,50%)",
						letterSpacing: "0.1em",
					}}
				>
					SPECHACK 2026
				</div>
				<div
					style={{
						fontSize: 72,
						fontFamily: "Orbitron",
						fontWeight: 700,
						color: "white",
						marginTop: 20,
					}}
				>
					{truncateName(card.name)}
				</div>
				<div
					style={{
						fontSize: 48,
						fontFamily: "JetBrains Mono",
						color: card.gradient.from,
						marginTop: 10,
					}}
				>
					{card.agentNumber}
				</div>
			</div>

			{/* Bottom section: Builder class + CTA */}
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						fontSize: 40,
						fontFamily: "Orbitron",
						fontWeight: 700,
						color: card.gradient.to,
					}}
				>
					{card.builderClass.name}
				</div>
				<div
					style={{
						fontSize: 28,
						fontFamily: "JetBrains Mono",
						color: "hsl(240,5%,60%)",
						marginTop: 10,
					}}
				>
					{card.builderClass.desc[locale as "es" | "en"]}
				</div>
				<div
					style={{
						fontSize: 24,
						fontFamily: "JetBrains Mono",
						color: "hsl(240,5%,40%)",
						marginTop: 40,
					}}
				>
					Join the challenge · June 19-28, 2026
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ name: "Orbitron", data: orbitronBold, weight: 700, style: "normal" },
				{
					name: "JetBrains Mono",
					data: jetbrainsMonoReg,
					weight: 400,
					style: "normal",
				},
			],
		},
	);
}
