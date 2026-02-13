import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js opengraph-image convention requires exporting metadata
export const alt = "404 Tech Found";
// biome-ignore lint/style/useComponentExportOnlyModules: Next.js opengraph-image convention requires exporting metadata
export const size = {
	width: 1200,
	height: 630,
};
// biome-ignore lint/style/useComponentExportOnlyModules: Next.js opengraph-image convention requires exporting metadata
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	// Fetch fonts from Google Fonts (next/font not available in ImageResponse runtime)
	const orbitronBold = await fetch(
		new URL("https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap"),
	).then((res) => res.arrayBuffer());

	const interSemiBold = await fetch(
		new URL("https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap"),
	).then((res) => res.arrayBuffer());

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#0a0a0a",
				backgroundImage:
					"radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
				position: "relative",
			}}
		>
			{/* Purple radial glow */}
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "800px",
					height: "800px",
					background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
					display: "flex",
				}}
			/>

			{/* Content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 10,
					padding: "0 80px",
				}}
			>
				<div
					style={{
						fontSize: 72,
						fontWeight: 700,
						color: "white",
						textAlign: "center",
						fontFamily: "Orbitron",
						letterSpacing: "-0.02em",
						marginBottom: "24px",
						display: "flex",
					}}
				>
					{t("title")}
				</div>
				<div
					style={{
						fontSize: 36,
						color: "#a1a1aa",
						textAlign: "center",
						fontFamily: "Inter",
						fontWeight: 600,
						display: "flex",
					}}
				>
					{t("tagline")}
				</div>
			</div>

			{/* House color bar at bottom */}
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: "8px",
					display: "flex",
					flexDirection: "row",
				}}
			>
				<div
					style={{
						flex: 1,
						background: "#ec4899",
						display: "flex",
					}}
				/>
				<div
					style={{
						flex: 1,
						background: "#10b981",
						display: "flex",
					}}
				/>
				<div
					style={{
						flex: 1,
						background: "#f97316",
						display: "flex",
					}}
				/>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Orbitron",
					data: orbitronBold,
					style: "normal",
					weight: 700,
				},
				{
					name: "Inter",
					data: interSemiBold,
					style: "normal",
					weight: 600,
				},
			],
		},
	);
}
