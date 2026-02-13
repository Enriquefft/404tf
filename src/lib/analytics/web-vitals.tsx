"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePostHog } from "posthog-js/react";

export function WebVitals() {
	const posthog = usePostHog();

	useReportWebVitals((metric) => {
		// Guard: only capture if PostHog is configured
		if (posthog) {
			posthog.capture("web_vitals", {
				metric_name: metric.name,
				metric_value: metric.value,
				metric_id: metric.id,
				metric_rating: metric.rating,
			});
		}
	});

	return null;
}
