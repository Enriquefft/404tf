import { useCallback, useRef, useState } from "react";
import { type ZodError, z } from "zod";
import type { Locale } from "@/i18n/translations";
import { getTranslations } from "@/i18n/translations";
import {
	INDUSTRY_OPTIONS,
	ROLE_OPTIONS,
	step1Schema,
	step2Schema,
	TIMELINE_OPTIONS,
} from "@/lib/corporate-schema";
import { track } from "@/lib/track";

const responseSchema = z.object({ success: z.boolean() });

type ContextStartup = {
	slug: string;
	name: string;
	vertical: string;
};

type CorporateFormProps = {
	locale: Locale;
	contextStartup?: ContextStartup | null;
	onSuccess?: () => void;
};

type FieldErrors = Record<string, string>;

type FormData = {
	name: string;
	email: string;
	company: string;
	role: string;
	industry: string;
	challenge: string;
	timeline: string;
	notes: string;
};

const INITIAL_FORM: FormData = {
	name: "",
	email: "",
	company: "",
	role: "",
	industry: "",
	challenge: "",
	timeline: "",
	notes: "",
};

function mapZodErrors(error: ZodError, locale: Locale): FieldErrors {
	const t = getTranslations(locale).corporate;
	const errors: FieldErrors = {};
	for (const issue of error.issues) {
		const field = String(issue.path[0]);
		if (issue.message === "required") {
			errors[field] = t.fieldRequired;
		} else if (issue.message === "invalid_email") {
			errors[field] = t.invalidEmail;
		} else {
			errors[field] = issue.message;
		}
	}
	return errors;
}

function getVerticalColor(vertical: string): string {
	const map: Record<string, string> = {
		ai_ml: "var(--v-ai)",
		biotech: "var(--v-biotech)",
		hardware_robotics: "var(--v-hardware)",
		cleantech: "var(--v-cleantech)",
		agritech: "var(--v-agritech)",
		healthtech: "var(--v-medtech)",
		advanced_materials: "var(--v-materials)",
		aerospace: "var(--v-aerospace)",
		quantum: "var(--v-quantum)",
		other: "var(--v-other)",
	};
	return map[vertical] ?? "var(--primary)";
}

export function CorporateForm({ locale, contextStartup, onSuccess }: CorporateFormProps) {
	const t = getTranslations(locale);
	const c = t.corporate;

	const [step, setStep] = useState(1);
	const [form, setForm] = useState<FormData>(INITIAL_FORM);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [submitError, setSubmitError] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const honeypotRef = useRef<HTMLInputElement>(null);

	const updateField = useCallback((field: keyof FormData, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}, []);

	const markTouched = useCallback((field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	}, []);

	const validateField = useCallback(
		(field: string) => {
			if (step === 1) {
				const result = step1Schema.safeParse(form);
				if (!result.success) {
					const mapped = mapZodErrors(result.error, locale);
					if (mapped[field]) {
						setErrors((prev) => ({ ...prev, [field]: mapped[field] }));
					}
				}
			} else {
				const result = step2Schema.safeParse(form);
				if (!result.success) {
					const mapped = mapZodErrors(result.error, locale);
					if (mapped[field]) {
						setErrors((prev) => ({ ...prev, [field]: mapped[field] }));
					}
				}
			}
		},
		[form, locale, step],
	);

	const handleBlur = useCallback(
		(field: string) => {
			markTouched(field);
			validateField(field);
		},
		[markTouched, validateField],
	);

	const goToStep2 = useCallback(() => {
		const result = step1Schema.safeParse(form);
		if (!result.success) {
			setErrors(mapZodErrors(result.error, locale));
			setTouched({ name: true, email: true });
			return;
		}
		setErrors({});
		setStep(2);
	}, [form, locale]);

	const goToStep1 = useCallback(() => {
		setErrors({});
		setStep(1);
	}, []);

	const handleSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement>) => {
			event.preventDefault();
			setSubmitError(false);

			const result = step2Schema.safeParse(form);
			if (!result.success) {
				setErrors(mapZodErrors(result.error, locale));
				setTouched({ industry: true, challenge: true });
				return;
			}

			setSubmitting(true);
			try {
				const response = await fetch("/api/leads/corporate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...form,
						contextStartupSlug: contextStartup?.slug ?? undefined,
						honeypot: honeypotRef.current?.value ?? "",
					}),
				});

				if (!response.ok) {
					setSubmitError(true);
					return;
				}

				const data: unknown = await response.json();
				const parsed = responseSchema.safeParse(data);
				if (parsed.success && parsed.data.success) {
					setSuccess(true);
					track("corporate_lead_submitted", {
						industry: form.industry,
						context_startup: contextStartup?.slug ?? null,
					});
				} else {
					setSubmitError(true);
				}
			} catch {
				setSubmitError(true);
			} finally {
				setSubmitting(false);
			}
		},
		[form, locale, contextStartup],
	);

	// --- Success state ---
	if (success) {
		return (
			<div className="flex flex-col items-center gap-6 py-8 text-center">
				{/* Checkmark animation */}
				<div
					className="flex h-16 w-16 items-center justify-center rounded-full"
					style={{
						background: "var(--success-muted)",
						animation: "corporate-check-in 400ms ease-out both",
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--success)"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>

				<div className="flex flex-col gap-2">
					<h3
						className="text-xl font-semibold"
						style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
					>
						{c.successTitle}
					</h3>
					<p
						className="max-w-sm text-sm"
						style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
					>
						{c.successMessage}
					</p>
				</div>

				<button
					type="button"
					onClick={onSuccess}
					className="mt-2 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out"
					style={{
						fontFamily: "var(--font-heading)",
						borderRadius: "var(--radius-md)",
						background: "var(--primary)",
						color: "var(--primary-foreground)",
					}}
				>
					{c.done}
				</button>

				<style>{`
					@keyframes corporate-check-in {
						from { opacity: 0; transform: scale(0.5); }
						to { opacity: 1; transform: scale(1); }
					}
				`}</style>
			</div>
		);
	}

	const stepLabel = c.stepOf.replace("{current}", String(step)).replace("{total}", "2");

	return (
		<form onSubmit={handleSubmit} noValidate>
			{/* Header */}
			<div className="mb-6 flex flex-col gap-3">
				<p
					className="text-xs font-semibold uppercase tracking-widest"
					style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}
				>
					404 Mapped
				</p>
				<h2
					className="text-2xl font-bold tracking-tight"
					style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
				>
					{c.title}
				</h2>

				{contextStartup && (
					<div className="flex items-center gap-2">
						<span
							className="text-sm"
							style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
						>
							{c.interestedIn}
						</span>
						<span
							className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
							style={{
								fontFamily: "var(--font-heading)",
								background: `color-mix(in srgb, ${getVerticalColor(contextStartup.vertical)} 15%, transparent)`,
								color: getVerticalColor(contextStartup.vertical),
								border: `1px solid color-mix(in srgb, ${getVerticalColor(contextStartup.vertical)} 30%, transparent)`,
							}}
						>
							{contextStartup.name}
						</span>
					</div>
				)}
			</div>

			{/* Progress indicator */}
			<div className="mb-6 flex flex-col gap-2">
				<p
					className="text-xs font-medium"
					style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
				>
					{stepLabel}
				</p>
				<div className="flex items-center gap-1.5">
					<StepDot active filled />
					<div
						className="h-0.5 flex-1"
						style={{
							background: step >= 2 ? "var(--primary)" : "var(--border)",
							transition: "background 200ms ease-out",
						}}
					/>
					<StepDot active={step >= 2} filled={step >= 2} />
				</div>
			</div>

			{/* Honeypot — visually hidden, bots fill it */}
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					width: "1px",
					height: "1px",
					padding: 0,
					margin: "-1px",
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
					whiteSpace: "nowrap",
					borderWidth: 0,
				}}
			>
				<label htmlFor="corporate-website">Website</label>
				<input
					ref={honeypotRef}
					id="corporate-website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			{/* Step 1 */}
			{step === 1 && (
				<div className="flex flex-col gap-4">
					<h3
						className="text-base font-semibold"
						style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
					>
						{c.step1Title}
					</h3>

					<FormInput
						label={c.nameLabel}
						name="name"
						value={form.name}
						placeholder={c.namePlaceholder}
						error={touched.name ? errors.name : undefined}
						required
						onChange={(v) => updateField("name", v)}
						onBlur={() => handleBlur("name")}
					/>

					<FormInput
						label={c.emailLabel}
						name="email"
						type="email"
						value={form.email}
						placeholder={c.emailPlaceholder}
						error={touched.email ? errors.email : undefined}
						required
						onChange={(v) => updateField("email", v)}
						onBlur={() => handleBlur("email")}
					/>

					<FormInput
						label={c.companyLabel}
						name="company"
						value={form.company}
						placeholder={c.companyPlaceholder}
						onChange={(v) => updateField("company", v)}
					/>

					<FormSelect
						label={c.roleLabel}
						name="role"
						value={form.role}
						placeholder={c.rolePlaceholder}
						options={ROLE_OPTIONS.map((key) => ({
							value: key,
							label: c.roles[key] ?? key,
						}))}
						onChange={(v) => updateField("role", v)}
					/>

					{/* Trust signal */}
					<p
						className="mt-1 text-center text-xs"
						style={{ fontFamily: "var(--font-body)", color: "var(--text-tertiary)" }}
					>
						{c.trustStep1}
					</p>

					{/* Next button */}
					<button
						type="button"
						onClick={goToStep2}
						className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out"
						style={{
							fontFamily: "var(--font-heading)",
							borderRadius: "var(--radius-md)",
							background: "var(--primary)",
							color: "var(--primary-foreground)",
						}}
					>
						{t.common.next}
						{/* Solar: Arrow Right Linear */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M4 12h16m0 0l-6-6m6 6l-6 6" />
						</svg>
					</button>
				</div>
			)}

			{/* Step 2 */}
			{step === 2 && (
				<div className="flex flex-col gap-4">
					<h3
						className="text-base font-semibold"
						style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
					>
						{c.step2Title}
					</h3>

					<FormSelect
						label={c.industryLabel}
						name="industry"
						value={form.industry}
						placeholder={c.industryPlaceholder}
						required
						error={touched.industry ? errors.industry : undefined}
						options={INDUSTRY_OPTIONS.map((key) => ({
							value: key,
							label: c.industries[key] ?? key,
						}))}
						onChange={(v) => updateField("industry", v)}
						onBlur={() => handleBlur("industry")}
					/>

					<FormTextarea
						label={c.challengeLabel}
						name="challenge"
						value={form.challenge}
						placeholder={c.challengePlaceholder}
						required
						error={touched.challenge ? errors.challenge : undefined}
						onChange={(v) => updateField("challenge", v)}
						onBlur={() => handleBlur("challenge")}
					/>

					<FormSelect
						label={c.timelineLabel}
						name="timeline"
						value={form.timeline}
						placeholder={c.timelinePlaceholder}
						options={TIMELINE_OPTIONS.map((key) => ({
							value: key,
							label: c.timelines[key] ?? key,
						}))}
						onChange={(v) => updateField("timeline", v)}
					/>

					<FormTextarea
						label={c.notesLabel}
						name="notes"
						value={form.notes}
						placeholder={c.notesPlaceholder}
						rows={3}
						onChange={(v) => updateField("notes", v)}
					/>

					{/* Trust signal */}
					<p
						className="mt-1 text-center text-xs"
						style={{ fontFamily: "var(--font-body)", color: "var(--text-tertiary)" }}
					>
						{c.trustStep2}
					</p>

					{/* Submit error */}
					{submitError && (
						<p
							className="rounded-md px-3 py-2 text-sm"
							style={{
								fontFamily: "var(--font-body)",
								background: "var(--error-muted)",
								color: "var(--error)",
							}}
							role="alert"
						>
							{c.submitError}
						</p>
					)}

					{/* Action buttons */}
					<div className="mt-2 flex gap-3">
						<button
							type="button"
							onClick={goToStep1}
							className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 border font-semibold transition-all duration-150 ease-out"
							style={{
								fontFamily: "var(--font-heading)",
								borderRadius: "var(--radius-md)",
								borderColor: "var(--primary)",
								color: "var(--primary)",
								background: "transparent",
							}}
						>
							{t.common.back}
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="inline-flex min-h-11 flex-[2] cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
							style={{
								fontFamily: "var(--font-heading)",
								borderRadius: "var(--radius-md)",
								background: "var(--primary)",
								color: "var(--primary-foreground)",
							}}
						>
							{submitting ? (
								<>
									<LoadingSpinner />
									{t.common.loading}
								</>
							) : (
								t.common.submit
							)}
						</button>
					</div>
				</div>
			)}
		</form>
	);
}

// ---------------------------------------------------------------------------
// Sub-components (internal, not exported)
// ---------------------------------------------------------------------------

function StepDot({ active, filled }: { active: boolean; filled: boolean }) {
	return (
		<div
			className="flex h-3 w-3 items-center justify-center rounded-full border-2 transition-colors duration-200"
			style={{
				borderColor: active ? "var(--primary)" : "var(--border)",
				background: filled ? "var(--primary)" : "transparent",
			}}
		/>
	);
}

type FormInputProps = {
	label: string;
	name: string;
	type?: "text" | "email";
	value: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
};

function FormInput({
	label,
	name,
	type = "text",
	value,
	placeholder,
	required,
	error,
	onChange,
	onBlur,
}: FormInputProps) {
	const inputId = `corporate-${name}`;
	return (
		<div className="flex flex-col">
			<label
				htmlFor={inputId}
				className="mb-1.5 text-sm font-medium"
				style={{ fontFamily: "var(--font-heading)", color: "var(--muted-foreground)" }}
			>
				{label}
				{required && (
					<span style={{ color: "var(--destructive)" }} className="ml-0.5">
						*
					</span>
				)}
			</label>
			<input
				id={inputId}
				name={name}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				className="border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
				style={{
					fontFamily: "var(--font-body)",
					background: "var(--background)",
					color: "var(--foreground)",
					borderColor: error ? "var(--destructive)" : "var(--input)",
					borderRadius: "var(--radius-md)",
				}}
			/>
			{error && (
				<p
					className="mt-1 text-sm"
					style={{ fontFamily: "var(--font-body)", color: "var(--destructive)" }}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

type SelectOption = {
	value: string;
	label: string;
};

type FormSelectProps = {
	label: string;
	name: string;
	value: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	options: SelectOption[];
	onChange: (value: string) => void;
	onBlur?: () => void;
};

function FormSelect({
	label,
	name,
	value,
	placeholder,
	required,
	error,
	options,
	onChange,
	onBlur,
}: FormSelectProps) {
	const selectId = `corporate-${name}`;
	return (
		<div className="flex flex-col">
			<label
				htmlFor={selectId}
				className="mb-1.5 text-sm font-medium"
				style={{ fontFamily: "var(--font-heading)", color: "var(--muted-foreground)" }}
			>
				{label}
				{required && (
					<span style={{ color: "var(--destructive)" }} className="ml-0.5">
						*
					</span>
				)}
			</label>
			<div className="relative">
				<select
					id={selectId}
					name={name}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					className="w-full appearance-none border px-3.5 py-2.5 pr-10 transition-colors duration-150 focus:outline-none"
					style={{
						fontFamily: "var(--font-body)",
						background: "var(--background)",
						color: value ? "var(--foreground)" : "var(--text-tertiary)",
						borderColor: error ? "var(--destructive)" : "var(--input)",
						borderRadius: "var(--radius-md)",
					}}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{/* Solar: Alt Arrow Down Linear */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
					style={{ color: "var(--muted-foreground)" }}
					aria-hidden="true"
				>
					<path d="M19 9l-7 6-7-6" />
				</svg>
			</div>
			{error && (
				<p
					className="mt-1 text-sm"
					style={{ fontFamily: "var(--font-body)", color: "var(--destructive)" }}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

type FormTextareaProps = {
	label: string;
	name: string;
	value: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	rows?: number;
	onChange: (value: string) => void;
	onBlur?: () => void;
};

function FormTextarea({
	label,
	name,
	value,
	placeholder,
	required,
	error,
	rows = 4,
	onChange,
	onBlur,
}: FormTextareaProps) {
	const textareaId = `corporate-${name}`;
	return (
		<div className="flex flex-col">
			<label
				htmlFor={textareaId}
				className="mb-1.5 text-sm font-medium"
				style={{ fontFamily: "var(--font-heading)", color: "var(--muted-foreground)" }}
			>
				{label}
				{required && (
					<span style={{ color: "var(--destructive)" }} className="ml-0.5">
						*
					</span>
				)}
			</label>
			<textarea
				id={textareaId}
				name={name}
				value={value}
				placeholder={placeholder}
				rows={rows}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				className="resize-y border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
				style={{
					fontFamily: "var(--font-body)",
					background: "var(--background)",
					color: "var(--foreground)",
					borderColor: error ? "var(--destructive)" : "var(--input)",
					borderRadius: "var(--radius-md)",
				}}
			/>
			{error && (
				<p
					className="mt-1 text-sm"
					style={{ fontFamily: "var(--font-body)", color: "var(--destructive)" }}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

function LoadingSpinner() {
	return (
		<svg
			className="animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
		</svg>
	);
}
