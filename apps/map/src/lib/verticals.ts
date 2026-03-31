export const VERTICAL_CONFIG = {
	ai_ml: {
		color: "var(--v-ai)",
		muted: "rgba(255, 102, 179, 0.15)",
		label: { en: "AI / ML", es: "IA / ML" },
	},
	biotech: {
		color: "var(--v-biotech)",
		muted: "rgba(0, 189, 104, 0.15)",
		label: { en: "Biotech", es: "Biotecnología" },
	},
	hardware_robotics: {
		color: "var(--v-hardware)",
		muted: "rgba(255, 179, 0, 0.15)",
		label: { en: "Hardware / Robotics", es: "Hardware / Robótica" },
	},
	cleantech: {
		color: "var(--v-cleantech)",
		muted: "rgba(45, 212, 191, 0.15)",
		label: { en: "Cleantech", es: "Cleantech" },
	},
	agritech: {
		color: "var(--v-agritech)",
		muted: "rgba(163, 230, 53, 0.15)",
		label: { en: "Agritech", es: "Agritech" },
	},
	healthtech: {
		color: "var(--v-medtech)",
		muted: "rgba(248, 113, 113, 0.15)",
		label: { en: "HealthTech", es: "HealthTech" },
	},
	advanced_materials: {
		color: "var(--v-materials)",
		muted: "rgba(167, 139, 250, 0.15)",
		label: { en: "Advanced Materials", es: "Materiales Avanzados" },
	},
	aerospace: {
		color: "var(--v-aerospace)",
		muted: "rgba(56, 189, 248, 0.15)",
		label: { en: "Aerospace", es: "Aeroespacial" },
	},
	quantum: {
		color: "var(--v-quantum)",
		muted: "rgba(217, 70, 239, 0.15)",
		label: { en: "Quantum", es: "Cuántica" },
	},
	other: {
		color: "var(--v-other)",
		muted: "rgba(148, 163, 184, 0.15)",
		label: { en: "Other", es: "Otro" },
	},
} as const;

export type VerticalKey = keyof typeof VERTICAL_CONFIG;

export const MATURITY_CONFIG = {
	rd: {
		label: { en: "R&D", es: "I+D" },
	},
	prototype: {
		label: { en: "Prototype", es: "Prototipo" },
	},
	pilot: {
		label: { en: "Pilot", es: "Piloto" },
	},
	revenue: {
		label: { en: "Revenue", es: "Ingresos" },
	},
} as const;

export type MaturityKey = keyof typeof MATURITY_CONFIG;
