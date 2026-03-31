import { useCallback, useEffect, useState } from "react";
import { CorporateForm } from "@/components/corporate-form";
import type { Locale } from "@/i18n/translations";

type ContextStartup = {
	slug: string;
	name: string;
	vertical: string;
};

type CorporateFormStandaloneProps = {
	locale: Locale;
	startups: ReadonlyArray<{ slug: string; name: string; vertical: string }>;
};

export function CorporateFormStandalone({ locale, startups }: CorporateFormStandaloneProps) {
	const [contextStartup, setContextStartup] = useState<ContextStartup | null>(null);
	const [completed, setCompleted] = useState(false);

	// Read ?startup= query param to pre-fill context
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const startupSlug = params.get("startup");
		if (startupSlug) {
			const match = startups.find((s) => s.slug === startupSlug);
			if (match) {
				setContextStartup({
					slug: match.slug,
					name: match.name,
					vertical: match.vertical,
				});
			}
		}
	}, [startups]);

	const handleSuccess = useCallback(() => {
		setCompleted(true);
	}, []);

	if (completed) {
		return null;
	}

	return (
		<div
			className="mx-auto w-full max-w-lg border p-6 sm:p-8"
			style={{
				background: "var(--card)",
				borderColor: "var(--border)",
				borderRadius: "var(--radius-lg)",
			}}
		>
			<CorporateForm locale={locale} contextStartup={contextStartup} onSuccess={handleSuccess} />
		</div>
	);
}
