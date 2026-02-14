"use client";

import { useActionState, useState } from "react";
import { submitAmbassador } from "../_actions/ambassador.actions";

type AmbassadorFormProps = {
	locale: "es" | "en";
	translations: {
		applyCta: string;
		formName: string;
		formEmail: string;
		formCity: string;
		formCommunity: string;
		formSubmit: string;
		formSuccess: string;
	};
};

export function AmbassadorForm({ locale, translations }: AmbassadorFormProps) {
	const [state, formAction, isPending] = useActionState(submitAmbassador, null);
	const [isExpanded, setIsExpanded] = useState(false);

	// Success state
	if (state?.success) {
		return (
			<div className="flex items-center gap-2 text-spec-green font-mono text-sm">
				<svg
					className="w-5 h-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
					role="img"
					aria-label="checkmark"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5 13l4 4L19 7"
					/>
				</svg>
				{translations.formSuccess}
			</div>
		);
	}

	// Collapsed state (default)
	if (!isExpanded) {
		return (
			<button
				type="button"
				onClick={() => setIsExpanded(true)}
				className="bg-primary text-primary-foreground font-mono px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
			>
				{translations.applyCta}
			</button>
		);
	}

	// Expanded form
	return (
		<form action={formAction} className="space-y-4 mt-4">
			{/* Hidden locale field */}
			<input type="hidden" name="locale" value={locale} />

			{/* Name Input */}
			<div className="space-y-1">
				<label
					htmlFor="amb-name"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formName}
				</label>
				<input
					type="text"
					id="amb-name"
					name="name"
					required
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formName}
				/>
				{state?.errors?.name && (
					<p className="text-red-400 text-xs font-mono">
						{state.errors.name[0]}
					</p>
				)}
			</div>

			{/* Email Input */}
			<div className="space-y-1">
				<label
					htmlFor="amb-email"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formEmail}
				</label>
				<input
					type="email"
					id="amb-email"
					name="email"
					required
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formEmail}
				/>
				{state?.errors?.email && (
					<p className="text-red-400 text-xs font-mono">
						{state.errors.email[0]}
					</p>
				)}
			</div>

			{/* City Input */}
			<div className="space-y-1">
				<label
					htmlFor="amb-city"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formCity}
				</label>
				<input
					type="text"
					id="amb-city"
					name="city"
					required
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formCity}
				/>
				{state?.errors?.city && (
					<p className="text-red-400 text-xs font-mono">
						{state.errors.city[0]}
					</p>
				)}
			</div>

			{/* Community Textarea */}
			<div className="space-y-1">
				<label
					htmlFor="amb-community"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formCommunity}
				</label>
				<textarea
					id="amb-community"
					name="community"
					required
					rows={3}
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
					placeholder={translations.formCommunity}
				/>
				{state?.errors?.community && (
					<p className="text-red-400 text-xs font-mono">
						{state.errors.community[0]}
					</p>
				)}
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isPending}
				className="bg-primary text-primary-foreground font-mono px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
			>
				{isPending ? "..." : translations.formSubmit}
			</button>
		</form>
	);
}
