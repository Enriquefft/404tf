"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { z } from "zod";
import { submitAmbassador } from "../_actions/ambassador.actions";
import { useToast } from "./Toast";

const fieldSchemas = {
	name: z.string().min(2),
	email: z.string().email(),
	city: z.string().min(1),
	community: z.string().min(10),
};

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
		serverError: string;
		submitted: string;
	};
};

export function AmbassadorForm({ locale, translations }: AmbassadorFormProps) {
	const [state, formAction, isPending] = useActionState(submitAmbassador, null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const { showToast } = useToast();

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

	// Expanded form with success collapse animation
	return (
		<AnimatePresence mode="wait">
			{state?.success ? (
				<motion.div
					key="success"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="flex flex-col items-center gap-3 py-8"
				>
					<div className="font-mono text-2xl text-emerald-400">&#x2713;</div>
					<p className="font-mono text-sm text-emerald-300">
						{translations.submitted}
					</p>
				</motion.div>
			) : (
				<motion.form
					key="form"
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					action={formAction}
					className="space-y-4 mt-4"
				>
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
							onBlur={(e) => validateField("community", e.target.value)}
							className="w-full bg-muted border border-border rounded-md px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
							placeholder={translations.formCommunity}
						/>
						{(fieldErrors.community || state?.errors?.community?.[0]) && (
							<p className="text-red-400 text-xs font-mono">
								{fieldErrors.community || state?.errors?.community?.[0]}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isPending}
						className="bg-primary text-primary-foreground font-mono px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
					>
						{isPending ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							translations.formSubmit
						)}
					</button>
				</motion.form>
			)}
		</AnimatePresence>
	);
}
