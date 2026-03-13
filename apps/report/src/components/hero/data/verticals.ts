export type VerticalKey =
	| "ai"
	| "biotech"
	| "hardware"
	| "cleantech"
	| "agritech"
	| "medtech"
	| "materials"
	| "aerospace"
	| "quantum"
	| "fintech"
	| "blockchain"
	| "other";

export type Vertical = {
	key: VerticalKey;
	label: string;
	color: string;
	cssVar: string;
};

export const VERTICALS: Vertical[] = [
	{
		key: "ai",
		label: "AI / Machine Learning",
		color: "#FF66B3",
		cssVar: "--v-ai",
	},
	{
		key: "biotech",
		label: "Biotech / Synthetic Bio",
		color: "#00BD68",
		cssVar: "--v-biotech",
	},
	{
		key: "hardware",
		label: "Hardware / Robotics",
		color: "#FFB300",
		cssVar: "--v-hardware",
	},
	{
		key: "cleantech",
		label: "Cleantech / Climate",
		color: "#2DD4BF",
		cssVar: "--v-cleantech",
	},
	{
		key: "agritech",
		label: "Agritech / Food Tech",
		color: "#A3E635",
		cssVar: "--v-agritech",
	},
	{
		key: "medtech",
		label: "MedTech / HealthTech",
		color: "#F87171",
		cssVar: "--v-medtech",
	},
	{
		key: "materials",
		label: "Advanced Materials",
		color: "#A78BFA",
		cssVar: "--v-materials",
	},
	{
		key: "aerospace",
		label: "Aerospace / Space",
		color: "#38BDF8",
		cssVar: "--v-aerospace",
	},
	{
		key: "quantum",
		label: "Quantum Computing",
		color: "#D946EF",
		cssVar: "--v-quantum",
	},
	{ key: "fintech", label: "FinTech", color: "#6366F1", cssVar: "--v-fintech" },
	{
		key: "blockchain",
		label: "Blockchain / Web3",
		color: "#22D3EE",
		cssVar: "--v-blockchain",
	},
	{
		key: "other",
		label: "Other / Emerging",
		color: "#94A3B8",
		cssVar: "--v-other",
	},
];

export const VERTICAL_MAP: Record<VerticalKey, Vertical> = Object.fromEntries(
	VERTICALS.map((v) => [v.key, v]),
) as Record<VerticalKey, Vertical>;
