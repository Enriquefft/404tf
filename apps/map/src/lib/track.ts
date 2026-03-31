/**
 * PostHog event tracking utility.
 * Safely fires events when PostHog is loaded; no-ops otherwise.
 */

declare global {
	interface Window {
		posthog?: {
			capture: (event: string, properties?: Record<string, unknown>) => void;
		};
	}
}

export function track(event: string, properties?: Record<string, unknown>): void {
	if (typeof window !== "undefined" && window.posthog) {
		window.posthog.capture(event, properties);
	}
}
