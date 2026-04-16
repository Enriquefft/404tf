import {
	MATURITY_KEYS,
	type MaturityKey,
	VERTICAL_KEYS,
	type VerticalKey,
} from "@/lib/startup-schema";

export type { MaturityKey, VerticalKey };
// Re-export the DB-derived enum values and types so existing consumers can
// keep importing from "@/lib/verticals" without churn. The literal values
// themselves come from the Drizzle pgEnum (single source of truth).
export { MATURITY_KEYS, VERTICAL_KEYS };

type VerticalConfig = {
	color: string;
	muted: string;
	label: { en: string; es: string };
};

type MaturityConfig = {
	label: { en: string; es: string };
};

export const VERTICAL_CONFIG: Record<VerticalKey, VerticalConfig> = {
	ai_ml: {
		color: "var(--v-ai)",
		muted: "color-mix(in oklch, var(--v-ai) 12%, transparent)",
		label: { en: "AI / ML", es: "IA / ML" },
	},
	biotech: {
		color: "var(--v-biotech)",
		muted: "color-mix(in oklch, var(--v-biotech) 12%, transparent)",
		label: { en: "Biotech", es: "Biotecnología" },
	},
	hardware_robotics: {
		color: "var(--v-hardware)",
		muted: "color-mix(in oklch, var(--v-hardware) 12%, transparent)",
		label: { en: "Hardware / Robotics", es: "Hardware / Robótica" },
	},
	cleantech: {
		color: "var(--v-cleantech)",
		muted: "color-mix(in oklch, var(--v-cleantech) 12%, transparent)",
		label: { en: "Cleantech", es: "Cleantech" },
	},
	agritech: {
		color: "var(--v-agritech)",
		muted: "color-mix(in oklch, var(--v-agritech) 12%, transparent)",
		label: { en: "Agritech", es: "Agritech" },
	},
	healthtech: {
		color: "var(--v-medtech)",
		muted: "color-mix(in oklch, var(--v-medtech) 12%, transparent)",
		label: { en: "HealthTech", es: "HealthTech" },
	},
	advanced_materials: {
		color: "var(--v-materials)",
		muted: "color-mix(in oklch, var(--v-materials) 12%, transparent)",
		label: { en: "Advanced Materials", es: "Materiales Avanzados" },
	},
	aerospace: {
		color: "var(--v-aerospace)",
		muted: "color-mix(in oklch, var(--v-aerospace) 12%, transparent)",
		label: { en: "Aerospace", es: "Aeroespacial" },
	},
	quantum: {
		color: "var(--v-quantum)",
		muted: "color-mix(in oklch, var(--v-quantum) 12%, transparent)",
		label: { en: "Quantum", es: "Cuántica" },
	},
	other: {
		color: "var(--v-other)",
		muted: "color-mix(in oklch, var(--v-other) 12%, transparent)",
		label: { en: "Other", es: "Otro" },
	},
};

export const MATURITY_CONFIG: Record<MaturityKey, MaturityConfig> = {
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
};
