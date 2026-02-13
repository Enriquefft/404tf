"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Initialize PostHog outside component to avoid re-initialization on re-renders
if (typeof window !== "undefined") {
	const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
	const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

	if (posthogKey && posthogHost) {
		posthog.init(posthogKey, {
			api_host: posthogHost,
			person_profiles: "identified_only",
			capture_pageview: false, // Manual pageview tracking
			capture_pageleave: true,
		});
	}
}

export function PHProvider({ children }: { children: React.ReactNode }) {
	// Gracefully skip PostHog wrapping if env vars are missing
	const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
	const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

	if (!posthogKey || !posthogHost) {
		return <>{children}</>;
	}

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
