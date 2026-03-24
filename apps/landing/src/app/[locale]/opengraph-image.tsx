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
	const bigShouldersBold = await fetch(
		new URL(
			"https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700&display=swap",
		),
	).then((res) => res.arrayBuffer());

	const barlowSemiBold = await fetch(
		new URL(
			"https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600&display=swap",
		),
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
				backgroundColor: "#0F080F",
				position: "relative",
			}}
		>
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
						color: "#9B35A8",
						textAlign: "center",
						fontFamily: "Big Shoulders Display",
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
						color: "#766878",
						textAlign: "center",
						fontFamily: "Barlow Semi Condensed",
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
						background: "#E84070",
						display: "flex",
					}}
				/>
				<div
					style={{
						flex: 1,
						background: "#18C060",
						display: "flex",
					}}
				/>
				<div
					style={{
						flex: 1,
						background: "#D85030",
						display: "flex",
					}}
				/>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Big Shoulders Display",
					data: bigShouldersBold,
					style: "normal",
					weight: 700,
				},
				{
					name: "Barlow Semi Condensed",
					data: barlowSemiBold,
					style: "normal",
					weight: 600,
				},
			],
		},
	);
}
