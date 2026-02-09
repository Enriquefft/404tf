"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";
import type { FormState } from "../_actions/intent.actions";
import { submitIntent } from "../_actions/intent.actions";

const intents = [
	{ key: "build" as const, emoji: "🔬" },
	{ key: "collaborate" as const, emoji: "🤝" },
	{ key: "connect" as const, emoji: "🌐" },
] as const;

type IntentCTAProps = {
	locale: "es" | "en";
	translations: {
		headline: string;
		subtitle: string;
		build: string;
		collaborate: string;
		connect: string;
		name: string;
		email: string;
		buildSubmit: string;
		collaborateSubmit: string;
		connectSubmit: string;
		buildHelper: string;
		collaborateHelper: string;
		connectHelper: string;
		success: string;
		questions: string;
		errorName: string;
		errorEmail: string;
		errorIntent: string;
		errorGeneric: string;
		submitting: string;
	};
};

export function IntentCTA({ locale, translations }: IntentCTAProps) {
	const [state, formAction, isPending] = useActionState<FormState, FormData>(submitIntent, null);
	const [selectedIntent, setSelectedIntent] = useState<"build" | "collaborate" | "connect" | null>(
		null,
	);

	// Helper text and submit button text based on selected intent
	const getHelperText = () => {
		if (!selectedIntent) return "";
		if (selectedIntent === "build") return translations.buildHelper;
		if (selectedIntent === "collaborate") return translations.collaborateHelper;
		return translations.connectHelper;
	};

	const getSubmitText = () => {
		if (!selectedIntent) return "";
		if (selectedIntent === "build") return translations.buildSubmit;
		if (selectedIntent === "collaborate") return translations.collaborateSubmit;
		return translations.connectSubmit;
	};

	return (
		<section id="intent-cta" className="py-24 gradient-purple relative overflow-hidden">
			{/* Decorative grid */}
			<div
				className="absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						"linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="container mx-auto px-4 relative z-10">
				<div className="text-center mb-12">
					<h2 className="font-orbitron text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
						{translations.headline}
					</h2>
					<p className="text-primary-foreground/70 text-lg max-w-lg mx-auto">
						{translations.subtitle}
					</p>
				</div>

				{state?.success ? (
					// Success state
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center mb-12"
					>
						<p className="text-xl text-white font-semibold">{translations.success}</p>
					</motion.div>
				) : (
					// Form
					<form action={formAction}>
						{/* Hidden inputs */}
						<input type="hidden" name="locale" value={locale} />
						<input type="hidden" name="intent" value={selectedIntent || ""} />

						{/* Intent cards */}
						<div className="flex flex-col md:flex-row gap-4 justify-center mb-10 max-w-3xl mx-auto">
							{intents.map((intent) => {
								const isSelected = selectedIntent === intent.key;
								return (
									<motion.button
										key={intent.key}
										type="button"
										onClick={() => setSelectedIntent(intent.key)}
										whileTap={{ scale: 0.97 }}
										animate={
											isSelected
												? { scale: 1.05, borderColor: "rgba(255,255,255,0.6)" }
												: { scale: 1 }
										}
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
										className={`flex-1 rounded-xl border-2 p-6 text-center transition-all duration-300 ${
											isSelected
												? "border-white/60 bg-white/20"
												: "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/40"
										}`}
									>
										<span className="text-3xl mb-3 block">{intent.emoji}</span>
										<span className="font-orbitron text-sm font-bold text-primary-foreground">
											{translations[intent.key]}
										</span>
									</motion.button>
								);
							})}
						</div>

						{/* Intent validation error */}
						{state?.errors?.intent && (
							<p className="text-red-300 text-sm text-center mb-4 max-w-3xl mx-auto">
								{translations.errorIntent}
							</p>
						)}

						{/* Form fields (show when intent selected) */}
						<AnimatePresence>
							{selectedIntent && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
									className="max-w-md mx-auto space-y-4"
								>
									{/* Helper text */}
									<p className="text-white/70 text-sm text-center mb-6">{getHelperText()}</p>

									{/* Name field */}
									<div>
										<input
											type="text"
											name="name"
											placeholder={translations.name}
											required
											className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
										/>
										{state?.errors?.name && (
											<p className="text-red-300 text-sm mt-1">{translations.errorName}</p>
										)}
									</div>

									{/* Email field */}
									<div>
										<input
											type="email"
											name="email"
											placeholder={translations.email}
											required
											className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
										/>
										{state?.errors?.email && (
											<p className="text-red-300 text-sm mt-1">{translations.errorEmail}</p>
										)}
									</div>

									{/* Generic error */}
									{state?.success === false && !state?.errors && (
										<p className="text-red-300 text-sm text-center">{translations.errorGeneric}</p>
									)}

									{/* Submit button */}
									<button
										type="submit"
										disabled={isPending || !selectedIntent}
										className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
											isPending || !selectedIntent
												? "bg-white/20 cursor-not-allowed opacity-50 text-white"
												: "bg-white text-purple-600 hover:opacity-90"
										}`}
									>
										{isPending ? translations.submitting : getSubmitText()}
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</form>
				)}

				{/* Contact */}
				<div className="text-center mt-12">
					<p className="text-white/50 text-sm">
						{translations.questions}{" "}
						<a
							href="mailto:hola@404techfound.com"
							className="text-white underline underline-offset-2 hover:text-white/80"
						>
							hola@404techfound.com
						</a>
					</p>
				</div>
			</div>
		</section>
	);
}
