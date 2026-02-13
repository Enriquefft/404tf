"use client";

import { X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type AnnouncementBannerProps = {
	translations: {
		text: string;
		link: string;
	};
};

export function AnnouncementBanner({ translations }: AnnouncementBannerProps) {
	const [isDismissed, setIsDismissed] = useLocalStorage(
		"404tf:announcement-spechack:dismissed",
		false,
	);

	if (isDismissed) return null;

	return (
		<div
			id="announcement-banner"
			className="gradient-purple text-primary-foreground py-2.5 px-4 text-center text-sm font-medium relative z-50"
		>
			<span>{translations.text} </span>
			<a
				href="https://spechack.404tf.com"
				target="_blank"
				rel="noopener"
				className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
			>
				{translations.link}
			</a>
			<button
				type="button"
				onClick={() => setIsDismissed(true)}
				className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
				aria-label="Dismiss announcement"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}
