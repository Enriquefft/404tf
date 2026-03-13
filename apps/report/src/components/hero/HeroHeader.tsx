export function HeroHeader() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "1.25rem",
				textAlign: "center",
				position: "relative",
				zIndex: 2,
			}}
		>
			<img
				src="/brand/logo-transparent-ondark.svg"
				alt="404 Tech Found"
				style={{ height: "2.5rem", width: "auto" }}
			/>
			<h1
				style={{
					fontFamily: "var(--font-display)",
					fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
					fontWeight: 600,
					letterSpacing: "-0.04em",
					lineHeight: 1.1,
					color: "var(--foreground)",
					margin: 0,
				}}
			>
				LATAM Deeptech Report{" "}
				<span style={{ color: "var(--primary)" }}>2026</span>
			</h1>
			<p
				style={{
					fontFamily: "var(--font-body)",
					fontSize: "1.125rem",
					lineHeight: 1.6,
					color: "var(--muted-foreground)",
					maxWidth: "36rem",
					margin: 0,
				}}
			>
				Mapping the startups building hard-science solutions across Latin
				America
			</p>
		</div>
	);
}
