import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: 32,
				height: 32,
				backgroundColor: "#0F080F",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "baseline",
					fontFamily: "sans-serif",
					fontWeight: 800,
					fontSize: 14,
					color: "#D49420",
					letterSpacing: -0.5,
				}}
			>
				<span>4</span>
				<span
					style={{
						textDecoration: "line-through",
						textDecorationColor: "#9B35A8",
						textDecorationThickness: 2,
					}}
				>
					0
				</span>
				<span>4</span>
			</div>
		</div>,
		{ ...size },
	);
}
