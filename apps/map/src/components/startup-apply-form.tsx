import { type FormEvent, useState } from "react";
import { track } from "@/lib/track";

type StartupApplyFormProps = {
	translations: {
		step1Title: string;
		step2Title: string;
		stepOf: string;
		startupName: string;
		startupNamePlaceholder: string;
		website: string;
		websitePlaceholder: string;
		yourName: string;
		yourNamePlaceholder: string;
		yourRole: string;
		yourRolePlaceholder: string;
		email: string;
		emailPlaceholder: string;
		country: string;
		countryPlaceholder: string;
		vertical: string;
		verticalPlaceholder: string;
		maturity: string;
		maturityPlaceholder: string;
		oneLiner: string;
		oneLinerPlaceholder: string;
		why: string;
		whyPlaceholder: string;
		back: string;
		next: string;
		submit: string;
		success: string;
		required: string;
		invalidEmail: string;
		submitError: string;
	};
	countries: Array<{ value: string; label: string }>;
	verticals: Array<{ value: string; label: string }>;
	maturities: Array<{ value: string; label: string }>;
};

export function StartupApplyForm({
	translations: t,
	countries,
	verticals,
	maturities,
}: StartupApplyFormProps) {
	const [step, setStep] = useState(1);
	const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formData, setFormData] = useState({
		startupName: "",
		website: "",
		contactName: "",
		contactRole: "",
		email: "",
		country: "",
		vertical: "",
		maturity: "",
		oneLiner: "",
		pitch: "",
	});

	function updateField(field: string, value: string) {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	function validateStep1(): boolean {
		const newErrors: Record<string, string> = {};
		if (!formData.startupName.trim()) newErrors.startupName = t.required;
		if (!formData.contactName.trim()) newErrors.contactName = t.required;
		if (!formData.email.trim()) newErrors.email = t.required;
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t.invalidEmail;
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	function validateStep2(): boolean {
		const newErrors: Record<string, string> = {};
		if (!formData.country) newErrors.country = t.required;
		if (!formData.vertical) newErrors.vertical = t.required;
		if (!formData.maturity) newErrors.maturity = t.required;
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	function handleNext() {
		if (validateStep1()) setStep(2);
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!validateStep2()) return;

		setStatus("submitting");

		try {
			const res = await fetch("/api/leads/startup-apply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					honeypot: "",
				}),
			});

			if (!res.ok) {
				setStatus("error");
				return;
			}
			setStatus("success");
			track("startup_apply_submitted", {
				vertical: formData.vertical,
				country: formData.country,
			});
		} catch {
			setStatus("error");
		}
	}

	if (status === "success") {
		return (
			<div
				className="flex items-center gap-3 rounded-[var(--radius-md)] p-6"
				style={{ background: "var(--success-muted)" }}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--success)"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M9 12l2 2 4-4" />
					<circle cx="12" cy="12" r="10" />
				</svg>
				<span
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--foreground)",
					}}
				>
					{t.success}
				</span>
			</div>
		);
	}

	const stepLabel = t.stepOf.replace("{current}", String(step)).replace("{total}", "2");

	return (
		<form onSubmit={handleSubmit}>
			{/* Progress bar */}
			<div className="mb-6">
				<div className="mb-2 flex items-center justify-between">
					<span
						className="text-sm font-medium"
						style={{
							fontFamily: "var(--font-heading)",
							color: "var(--muted-foreground)",
						}}
					>
						{step === 1 ? t.step1Title : t.step2Title}
					</span>
					<span
						className="text-xs"
						style={{
							fontFamily: "var(--font-mono)",
							color: "var(--text-tertiary)",
						}}
					>
						{stepLabel}
					</span>
				</div>
				<div
					className="h-1 w-full overflow-hidden rounded-full"
					style={{ background: "var(--border-subtle)" }}
				>
					<div
						className="h-full rounded-full transition-all duration-300 ease-out"
						style={{
							width: step === 1 ? "50%" : "100%",
							background: "var(--primary)",
						}}
					/>
				</div>
			</div>

			{step === 1 && (
				<div className="flex flex-col gap-4">
					<FormField
						label={t.startupName}
						name="startupName"
						value={formData.startupName}
						placeholder={t.startupNamePlaceholder}
						required
						error={errors.startupName}
						onChange={(v) => updateField("startupName", v)}
					/>
					<FormField
						label={t.website}
						name="website"
						type="url"
						value={formData.website}
						placeholder={t.websitePlaceholder}
						onChange={(v) => updateField("website", v)}
					/>
					<FormField
						label={t.yourName}
						name="contactName"
						value={formData.contactName}
						placeholder={t.yourNamePlaceholder}
						required
						error={errors.contactName}
						onChange={(v) => updateField("contactName", v)}
					/>
					<FormField
						label={t.yourRole}
						name="contactRole"
						value={formData.contactRole}
						placeholder={t.yourRolePlaceholder}
						onChange={(v) => updateField("contactRole", v)}
					/>
					<FormField
						label={t.email}
						name="email"
						type="email"
						value={formData.email}
						placeholder={t.emailPlaceholder}
						required
						error={errors.email}
						onChange={(v) => updateField("email", v)}
					/>
					<div className="mt-2 flex justify-end">
						<button
							type="button"
							onClick={handleNext}
							className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out"
							style={{
								fontFamily: "var(--font-heading)",
								borderRadius: "var(--radius-md)",
								background: "var(--primary)",
								color: "var(--primary-foreground)",
							}}
						>
							{t.next}
						</button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="flex flex-col gap-4">
					<SelectField
						label={t.country}
						name="country"
						value={formData.country}
						placeholder={t.countryPlaceholder}
						options={countries}
						required
						error={errors.country}
						onChange={(v) => updateField("country", v)}
					/>
					<SelectField
						label={t.vertical}
						name="vertical"
						value={formData.vertical}
						placeholder={t.verticalPlaceholder}
						options={verticals}
						required
						error={errors.vertical}
						onChange={(v) => updateField("vertical", v)}
					/>
					<SelectField
						label={t.maturity}
						name="maturity"
						value={formData.maturity}
						placeholder={t.maturityPlaceholder}
						options={maturities}
						required
						error={errors.maturity}
						onChange={(v) => updateField("maturity", v)}
					/>
					<TextareaField
						label={t.oneLiner}
						name="oneLiner"
						value={formData.oneLiner}
						placeholder={t.oneLinerPlaceholder}
						maxLength={200}
						rows={2}
						onChange={(v) => updateField("oneLiner", v)}
					/>
					<TextareaField
						label={t.why}
						name="pitch"
						value={formData.pitch}
						placeholder={t.whyPlaceholder}
						rows={3}
						onChange={(v) => updateField("pitch", v)}
					/>

					{status === "error" && (
						<p
							className="text-sm"
							style={{
								color: "var(--destructive)",
								fontFamily: "var(--font-body)",
							}}
							role="alert"
						>
							{t.submitError}
						</p>
					)}

					<div className="mt-2 flex justify-between">
						<button
							type="button"
							onClick={() => setStep(1)}
							className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out"
							style={{
								fontFamily: "var(--font-heading)",
								borderRadius: "var(--radius-md)",
								background: "transparent",
								color: "var(--primary)",
								border: "1px solid var(--primary)",
							}}
						>
							{t.back}
						</button>
						<button
							type="submit"
							disabled={status === "submitting"}
							className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out disabled:opacity-50"
							style={{
								fontFamily: "var(--font-heading)",
								borderRadius: "var(--radius-md)",
								background: "var(--primary)",
								color: "var(--primary-foreground)",
							}}
						>
							{status === "submitting" ? "..." : t.submit}
						</button>
					</div>
				</div>
			)}
		</form>
	);
}

// Internal field components to avoid repeating styles

function FormField({
	label,
	name,
	type = "text",
	value,
	placeholder,
	required,
	error,
	onChange,
}: {
	label: string;
	name: string;
	type?: string;
	value: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`apply-${name}`}
				className="mb-1.5 text-sm font-medium"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--muted-foreground)",
				}}
			>
				{label}
				{required && (
					<span style={{ color: "var(--destructive)" }} className="ml-0.5">
						*
					</span>
				)}
			</label>
			<input
				id={`apply-${name}`}
				name={name}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				className="rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
				style={{
					fontFamily: "var(--font-body)",
					background: "var(--background)",
					borderColor: error ? "var(--destructive)" : "var(--input)",
					color: "var(--foreground)",
				}}
			/>
			{error && (
				<p
					className="mt-1 text-sm"
					style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

function SelectField({
	label,
	name,
	value,
	placeholder,
	options,
	required,
	error,
	onChange,
}: {
	label: string;
	name: string;
	value: string;
	placeholder?: string;
	options: Array<{ value: string; label: string }>;
	required?: boolean;
	error?: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`apply-${name}`}
				className="mb-1.5 text-sm font-medium"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--muted-foreground)",
				}}
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
					id={`apply-${name}`}
					name={name}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full appearance-none rounded-[var(--radius-md)] border px-3.5 py-2.5 pr-10 transition-colors duration-150 focus:outline-none"
					style={{
						fontFamily: "var(--font-body)",
						background: "var(--background)",
						borderColor: error ? "var(--destructive)" : "var(--input)",
						color: value ? "var(--foreground)" : "var(--text-tertiary)",
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
					style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

function TextareaField({
	label,
	name,
	value,
	placeholder,
	rows = 3,
	maxLength,
	onChange,
}: {
	label: string;
	name: string;
	value: string;
	placeholder?: string;
	rows?: number;
	maxLength?: number;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`apply-${name}`}
				className="mb-1.5 text-sm font-medium"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--muted-foreground)",
				}}
			>
				{label}
			</label>
			<textarea
				id={`apply-${name}`}
				name={name}
				value={value}
				placeholder={placeholder}
				rows={rows}
				maxLength={maxLength}
				onChange={(e) => onChange(e.target.value)}
				className="resize-y rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
				style={{
					fontFamily: "var(--font-body)",
					background: "var(--background)",
					borderColor: "var(--input)",
					color: "var(--foreground)",
				}}
			/>
			{maxLength && (
				<span
					className="mt-1 text-right text-xs"
					style={{
						fontFamily: "var(--font-mono)",
						color: "var(--text-tertiary)",
					}}
				>
					{value.length} / {maxLength}
				</span>
			)}
		</div>
	);
}
