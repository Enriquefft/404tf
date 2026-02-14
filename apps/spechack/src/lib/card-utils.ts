export type BuilderClass = {
	name: string;
	desc: { es: string; en: string };
};

export const BUILDER_CLASSES: BuilderClass[] = [
	{
		name: "The Architect",
		desc: {
			es: "Planifica todo, ejecuta impecable",
			en: "Plans everything, executes flawlessly",
		},
	},
	{
		name: "The Prototyper",
		desc: {
			es: "Construye rápido, itera más rápido",
			en: "Builds fast, iterates faster",
		},
	},
	{
		name: "The Full-Stack Maverick",
		desc: {
			es: "Front, back, infra, todo",
			en: "Front, back, infra, all of it",
		},
	},
	{
		name: "The Mad Scientist",
		desc: {
			es: "Experimentos que nadie pidió, pero todos necesitan",
			en: "Experiments nobody asked for, but everyone needs",
		},
	},
	{
		name: "The Systems Thinker",
		desc: {
			es: "Ve el panorama completo, construye la base",
			en: "Sees the big picture, builds the foundation",
		},
	},
	{
		name: "The Debug Whisperer",
		desc: {
			es: "Encuentra bugs antes de que existan",
			en: "Finds bugs before they exist",
		},
	},
];

/** Deterministic hash from a string */
export function hashStr(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = ((h << 5) - h + s.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
}

const GRADIENT_COMBOS = [
	["hsl(261,85%,50%)", "hsl(199,95%,60%)"], // purple -> cyan
	["hsl(261,85%,50%)", "hsl(330,80%,55%)"], // purple -> pink
	["hsl(199,95%,60%)", "hsl(142,71%,45%)"], // cyan -> green
	["hsl(330,80%,55%)", "hsl(40,95%,60%)"], // pink -> amber
	["hsl(142,71%,45%)", "hsl(261,85%,50%)"], // green -> purple
	["hsl(40,95%,60%)", "hsl(199,95%,60%)"], // amber -> cyan
	["hsl(261,85%,40%)", "hsl(199,95%,40%)"], // deep purple -> deep cyan
	["hsl(330,80%,45%)", "hsl(142,71%,35%)"], // deep pink -> deep green
];

/** Generate a deterministic gradient from a name */
export function generateCardGradient(name: string): {
	from: string;
	to: string;
	angle: number;
} {
	const h = hashStr(name);
	const combo = GRADIENT_COMBOS[h % GRADIENT_COMBOS.length];
	const angle = 120 + (h % 120); // 120-240 degrees
	return { from: combo[0], to: combo[1], angle };
}

/** Randomly assign a builder class at registration time */
export function getRandomBuilderClass(): BuilderClass {
	return BUILDER_CLASSES[Math.floor(Math.random() * BUILDER_CLASSES.length)];
}

/** Deterministic builder class from name (for challenge pages in Phase 6) */
export function getDeterministicBuilderClass(name: string): BuilderClass {
	return BUILDER_CLASSES[hashStr(name) % BUILDER_CLASSES.length];
}

export const PLACEHOLDER_AGENT_NUMBER = "SPEC-????";

/**
 * Generate a deterministic trading card from a name alone (for challenge pages).
 * Does not require database lookup. Always produces same card for same name.
 * Uses hash-based agent number for consistent preview.
 */
export function generateDeterministicCard(name: string): CardData {
	// Capitalize first letter of each word for display
	const displayName = name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

	// Generate deterministic 4-digit agent number from hash
	const hash = hashStr(displayName);
	const agentNum = (hash % 9000) + 1000; // Range: 1000-9999

	return {
		agentNumber: `SPEC-${agentNum.toString().padStart(4, "0")}`,
		name: displayName,
		city: "Virtual",
		track: "virtual" as const,
		builderClass: getDeterministicBuilderClass(displayName),
		gradient: generateCardGradient(displayName),
	};
}

export type CardData = {
	agentNumber: string;
	name: string;
	city: string;
	track: "virtual" | "hub";
	builderClass: BuilderClass;
	gradient: { from: string; to: string; angle: number };
};

const CITY_FLAGS: Record<string, string> = {
	lima: "\u{1F1F5}\u{1F1EA}",
	"sao paulo": "\u{1F1E7}\u{1F1F7}",
	"buenos aires": "\u{1F1E6}\u{1F1F7}",
	bogota: "\u{1F1E8}\u{1F1F4}",
	"mexico city": "\u{1F1F2}\u{1F1FD}",
	santiago: "\u{1F1E8}\u{1F1F1}",
	quito: "\u{1F1EA}\u{1F1E8}",
	caracas: "\u{1F1FB}\u{1F1EA}",
	montevideo: "\u{1F1FA}\u{1F1FE}",
	asuncion: "\u{1F1F5}\u{1F1FE}",
	"la paz": "\u{1F1E7}\u{1F1F4}",
	"san jose": "\u{1F1E8}\u{1F1F7}",
	panama: "\u{1F1F5}\u{1F1E6}",
	guatemala: "\u{1F1EC}\u{1F1F9}",
	havana: "\u{1F1E8}\u{1F1FA}",
	managua: "\u{1F1F3}\u{1F1EE}",
	tegucigalpa: "\u{1F1ED}\u{1F1F3}",
	"san salvador": "\u{1F1F8}\u{1F1FB}",
	belize: "\u{1F1E7}\u{1F1FF}",
	"santo domingo": "\u{1F1E9}\u{1F1F4}",
	"port-au-prince": "\u{1F1ED}\u{1F1F9}",
	kingston: "\u{1F1EF}\u{1F1F2}",
	paramaribo: "\u{1F1F8}\u{1F1F7}",
	cayenne: "\u{1F1EC}\u{1F1EB}",
	georgetown: "\u{1F1EC}\u{1F1FE}",
	virtual: "\u{1F310}",
};

export function getCountryFlag(city: string): string {
	return CITY_FLAGS[city.toLowerCase().trim()] ?? "\u{1F30D}";
}

/**
 * Truncate name for display on trading cards.
 * Full name preserved in metadata; truncated for visual display only.
 */
export function truncateName(name: string, maxLength = 20): string {
	if (name.length <= maxLength) return name;
	return `${name.slice(0, maxLength)}\u2026`;
}
