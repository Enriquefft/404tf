import { useState } from "react";
import { CorporateModal } from "@/components/corporate-modal";
import type { Locale } from "@/i18n/translations";
import { track } from "@/lib/track";

type ContextStartup = {
	slug: string;
	name: string;
	vertical: string;
};

type CorporateCTAIslandProps = {
	locale: Locale;
	label: string;
	variant: "primary" | "secondary";
	contextStartup?: ContextStartup | null;
};

const VARIANT_STYLES = {
	primary: {
		background: "var(--primary)",
		color: "var(--primary-foreground)",
		border: "none",
	},
	secondary: {
		background: "transparent",
		color: "var(--primary)",
		border: "1px solid var(--primary)",
	},
} as const;

export function CorporateCTAIsland({
	locale,
	label,
	variant,
	contextStartup,
}: CorporateCTAIslandProps) {
	const [isOpen, setIsOpen] = useState(false);
	const styles = VARIANT_STYLES[variant];

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setIsOpen(true);
					track("corporate_modal_opened", {
						context_startup: contextStartup?.slug ?? null,
					});
				}}
				className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out"
				style={{
					fontFamily: "var(--font-heading)",
					borderRadius: "var(--radius-md)",
					...styles,
				}}
			>
				{label}
			</button>
			<CorporateModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				locale={locale}
				contextStartup={contextStartup}
			/>
		</>
	);
}
