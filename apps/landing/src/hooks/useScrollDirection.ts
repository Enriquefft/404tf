"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect scroll direction
 * @returns "up" | "down" | null
 */
export function useScrollDirection() {
	const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
		null,
	);

	useEffect(() => {
		let lastScrollY = window.scrollY;

		const updateScrollDirection = () => {
			const scrollY = window.scrollY;
			const direction = scrollY > lastScrollY ? "down" : "up";

			// Only update if scroll delta > 10px to avoid jitter
			if (
				direction !== scrollDirection &&
				Math.abs(scrollY - lastScrollY) > 10
			) {
				setScrollDirection(direction);
			}

			lastScrollY = scrollY > 0 ? scrollY : 0;
		};

		window.addEventListener("scroll", updateScrollDirection, { passive: true });
		return () => window.removeEventListener("scroll", updateScrollDirection);
	}, [scrollDirection]);

	return scrollDirection;
}
