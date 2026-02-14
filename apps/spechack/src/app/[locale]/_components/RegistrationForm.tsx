"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { z } from "zod";
import type { CardData } from "@/lib/card-utils";
import {
	loadCardFromStorage,
	saveCardToStorage,
} from "@/lib/card-utils.client";
import { submitRegistration } from "../_actions/register.actions";
import { CardReveal } from "./CardReveal";
import { useToast } from "./Toast";

const fieldSchemas = {
	name: z.string().min(2),
	email: z.string().email(),
	city: z.string().min(1),
};

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
		serverError: string;
	};
	cardTranslations: {
		download: string;
		shareX: string;
		challenge: string;
		challengeCopy: string;
		challengeWhatsApp: string;
		challengeLinkedIn: string;
		recruitMore: string;
		tweetTemplate: string;
	};
};

export function RegistrationForm({
	locale,
	translations,
	cardTranslations,
}: RegistrationFormProps) {
	const [state, formAction, isPending] = useActionState(
		submitRegistration,
		null,
	);
	const [track, setTrack] = useState<"virtual" | "hub">("virtual");
	const [city, setCity] = useState("");
	const [savedCard, setSavedCard] = useState<CardData | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const { showToast } = useToast();

	// Check localStorage on mount for returning users
	useEffect(() => {
		const loaded = loadCardFromStorage();
		if (loaded) setSavedCard(loaded);
	}, []);

	// Show toast for server errors
	useEffect(() => {
		if (state && !state.success && state.message === "server_error") {
			showToast(translations.serverError);
		}
	}, [state]); // eslint-disable-line react-hooks/exhaustive-deps

	const validateField = (field: string, value: string) => {
		const schema = fieldSchemas[field as keyof typeof fieldSchemas];
		if (!schema) return;
		const result = schema.safeParse(value);
		if (!result.success) {
			setFieldErrors((prev) => ({
				...prev,
				[field]: result.error.issues[0].message,
			}));
		} else {
			setFieldErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}
	};

	// Success state - construct CardData and show CardReveal
	if (state?.success && state.data) {
		const cardData: CardData = {
			agentNumber: state.data.agentNumber,
			name: state.data.name,
			city: city,
			track: track,
			builderClass: {
				name: state.data.builderClass,
				desc: state.data.builderClassDesc,
			},
			gradient: JSON.parse(state.data.gradientData),
		};
		// Save to localStorage for returning users
		saveCardToStorage(cardData);
		return (
			<CardReveal
				card={cardData}
				locale={locale}
				translations={cardTranslations}
			/>
		);
	}

	// Returning user with saved card
	if (savedCard) {
		return (
			<CardReveal
				card={savedCard}
				locale={locale}
				translations={cardTranslations}
			/>
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
					onBlur={(e) => validateField("name", e.target.value)}
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formName}
				/>
				{(fieldErrors.name || state?.errors?.name?.[0]) && (
					<p className="text-red-400 text-xs font-mono">
						{fieldErrors.name || state?.errors?.name?.[0]}
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
					onBlur={(e) => validateField("email", e.target.value)}
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formEmail}
				/>
				{(fieldErrors.email || state?.errors?.email?.[0]) && (
					<p className="text-red-400 text-xs font-mono">
						{fieldErrors.email || state?.errors?.email?.[0]}
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
					value={city}
					onChange={(e) => setCity(e.target.value)}
					onBlur={(e) => validateField("city", e.target.value)}
					className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={translations.formCity}
				/>
				{(fieldErrors.city || state?.errors?.city?.[0]) && (
					<p className="text-red-400 text-xs font-mono">
						{fieldErrors.city || state?.errors?.city?.[0]}
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
				className="w-full bg-primary text-primary-foreground font-mono text-sm px-6 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
			>
				{isPending ? (
					<Loader2 className="h-5 w-5 animate-spin" />
				) : (
					translations.submit
				)}
			</button>

			{/* Form Note */}
			<p className="font-mono text-xs text-muted-foreground">
				{translations.formNote}
			</p>
		</form>
	);
}
