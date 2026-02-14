/** Card dimensions in Three.js units (3:4 aspect ratio) */
export const CARD_WIDTH = 3;
export const CARD_HEIGHT = 4;
export const CARD_DEPTH = 0.05;

/** Canvas texture resolution (2x for crisp text on high-DPI) */
export const TEXTURE_WIDTH = 1200;
export const TEXTURE_HEIGHT = 1600;

/** Reveal phase timing (seconds) */
export const PHASE_SIGNAL_LOCK = 1.5;
export const PHASE_MATERIALIZE_END = 3.0;

/** Physics config */
export const ANGULAR_DAMPING = 3;
export const LINEAR_DAMPING = 2;
export const FLICK_THRESHOLD = 3;
export const FLIP_IMPULSE = 12;

/** Particles */
export const PARTICLE_COUNT = 200;
export const PARTICLE_SPREAD = 8;

/** Gyroscope */
export const GYRO_MAX_TILT = Math.PI / 12; // 15 degrees

/** Glitch config */
export const GLITCH_FPS = 10;

/** Builder class stat axes for radar chart */
export const STAT_AXES = [
	"creativity",
	"speed",
	"debugging",
	"architecture",
	"resilience",
	"innovation",
] as const;

/** Map builder class name to stat weights (0-1 per axis) */
export function getBuilderStats(className: string): number[] {
	const map: Record<string, number[]> = {
		"The Architect": [0.6, 0.5, 0.7, 1.0, 0.8, 0.5],
		"The Prototyper": [0.8, 1.0, 0.4, 0.5, 0.6, 0.9],
		"The Full-Stack Maverick": [0.7, 0.7, 0.7, 0.8, 0.7, 0.7],
		"The Mad Scientist": [1.0, 0.6, 0.5, 0.4, 0.5, 1.0],
		"The Systems Thinker": [0.5, 0.4, 0.8, 1.0, 0.9, 0.6],
		"The Debug Whisperer": [0.5, 0.5, 1.0, 0.7, 0.9, 0.6],
	};
	return map[className] ?? [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
}
