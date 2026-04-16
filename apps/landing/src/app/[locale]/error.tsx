"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("Error");

	useEffect(() => {
		// Log error to console for debugging
		console.error("Error boundary caught:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="max-w-2xl text-center">
				{/* Error icon */}
				<div className="mb-8">
					<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/10">
						<svg
							className="h-12 w-12 text-purple-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-label="Error icon"
						>
							<title>Error</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
				</div>

				{/* Title and description */}
				<h2 className="mb-4 text-3xl font-bold text-foreground">{t("title")}</h2>
				<p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>

				{/* Retry button */}
				<button
					type="button"
					onClick={() => reset()}
					className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
				>
					{t("retry")}
				</button>
			</div>
		</div>
	);
}
