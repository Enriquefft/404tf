"use client";

import { useActionState, useState } from "react";
import { submitRegistration } from "../_actions/register.actions";

type RegistrationFormProps = {
	locale: "es" | "en";
	translations: {
		formTitle: string;
		formName: string;
		formEmail: string;
		formCity: string;
		trackVirtual: string;
		trackHub: string;
		trackVirtualHelper: string;
		trackHubHelper: string;
		submit: string;
		formNote: string;
		successTitle: string;
		successSub: string;
	};
};

export function RegistrationForm({
	locale,
	translations,
}: RegistrationFormProps) {
	const [state, formAction, isPending] = useActionState(
		submitRegistration,
		null,
	);
	const [track, setTrack] = useState<"virtual" | "hub">("virtual");

	// Success state
	if (state?.success) {
		return (
			<div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4 text-center">
				<h2 className="font-orbitron font-bold text-2xl">
					{translations.successTitle}
				</h2>
				<p className="font-mono text-3xl text-primary font-bold">
					{state.data?.agentNumber}
				</p>
				<p className="text-muted-foreground text-sm">
					{translations.successSub}
				</p>
			</div>
		);
	}

	// Form state (default)
	return (
		<form
			action={formAction}
			className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6"
		>
			<h2 className="font-orbitron font-bold text-2xl">
				{translations.formTitle}
			</h2>

			{/* Hidden fields */}
			<input type="hidden" name="locale" value={locale} />
			<input type="hidden" name="track" value={track} />

			{/* Name Input */}
			<div className="space-y-2">
				<label
					htmlFor="reg-name"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formName}
				</label>
				<input
					type="text"
					id="reg-name"
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
			<div className="space-y-2">
				<label
					htmlFor="reg-email"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formEmail}
				</label>
				<input
					type="email"
					id="reg-email"
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
			<div className="space-y-2">
				<label
					htmlFor="reg-city"
					className="block font-mono text-xs text-muted-foreground uppercase tracking-wider"
				>
					{translations.formCity}
				</label>
				<input
					type="text"
					id="reg-city"
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

			{/* Track Toggle */}
			<div className="space-y-2">
				<div className="flex gap-2 bg-muted p-1 rounded-md">
					<button
						type="button"
						onClick={() => setTrack("virtual")}
						className={`flex-1 rounded px-4 py-2 font-mono text-xs font-bold transition-all ${
							track === "virtual"
								? "bg-background border border-border"
								: "bg-transparent border border-transparent text-muted-foreground"
						}`}
					>
						{translations.trackVirtual}
					</button>
					<button
						type="button"
						onClick={() => setTrack("hub")}
						className={`flex-1 rounded px-4 py-2 font-mono text-xs font-bold transition-all ${
							track === "hub"
								? "bg-background border border-border"
								: "bg-transparent border border-transparent text-muted-foreground"
						}`}
					>
						{translations.trackHub}
					</button>
				</div>
				<p className="font-mono text-xs text-muted-foreground">
					{track === "virtual"
						? translations.trackVirtualHelper
						: translations.trackHubHelper}
				</p>
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isPending}
				className="w-full bg-primary text-primary-foreground font-mono text-sm px-6 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
			>
				{isPending ? "..." : translations.submit}
			</button>

			{/* Form Note */}
			<p className="font-mono text-xs text-muted-foreground">
				{translations.formNote}
			</p>
		</form>
	);
}
