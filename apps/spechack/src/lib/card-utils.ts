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
