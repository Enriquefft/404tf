import { useState } from "react";

export function HeroCTAs() {
	const [primaryHover, setPrimaryHover] = useState(false);
	const [secondaryHover, setSecondaryHover] = useState(false);

	return (
		<div
			style={{
				display: "flex",
				gap: "1rem",
				justifyContent: "center",
				flexWrap: "wrap",
				position: "relative",
				zIndex: 2,
			}}
		>
			<button
				type="button"
				style={{
					background: primaryHover ? "var(--primary-light)" : "var(--primary)",
					color: "var(--foreground)",
					fontFamily: "var(--font-heading)",
					fontWeight: 600,
					fontSize: "0.9375rem",
					padding: "0.75rem 1.75rem",
					borderRadius: "var(--radius-md)",
					border: "none",
					cursor: "pointer",
					transition: "all 150ms ease-out",
				}}
				onMouseEnter={() => setPrimaryHover(true)}
				onMouseLeave={() => setPrimaryHover(false)}
			>
				Explore Directory
			</button>
			<button
				type="button"
				style={{
					background: secondaryHover ? "var(--primary-8)" : "transparent",
					color: "var(--primary)",
					fontFamily: "var(--font-heading)",
					fontWeight: 600,
					fontSize: "0.9375rem",
					padding: "0.75rem 1.75rem",
					borderRadius: "var(--radius-md)",
					border: `1px solid ${secondaryHover ? "var(--primary-60)" : "var(--primary-40)"}`,
					cursor: "pointer",
					transition: "all 150ms ease-out",
				}}
				onMouseEnter={() => setSecondaryHover(true)}
				onMouseLeave={() => setSecondaryHover(false)}
			>
				Download Report
			</button>
		</div>
	);
}
