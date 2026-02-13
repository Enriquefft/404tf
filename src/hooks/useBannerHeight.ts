"use client";

import { useEffect, useState } from "react";

export function useBannerHeight() {
	const [bannerHeight, setBannerHeight] = useState(0);

	useEffect(() => {
		const updateHeight = () => {
			const banner = document.getElementById("announcement-banner");
			if (banner) {
				setBannerHeight(banner.offsetHeight);
			} else {
				setBannerHeight(0);
			}
		};

		// Initial measurement
		updateHeight();

		// Observe banner changes (dismissal, resize)
		const observer = new MutationObserver(updateHeight);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		// Handle window resize
		window.addEventListener("resize", updateHeight);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateHeight);
		};
	}, []);

	return bannerHeight;
}
