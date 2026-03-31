import { type FormEvent, useState } from "react";
import { track } from "@/lib/track";

type StartupProgramFormProps = {
	translations: {
		startupName: string;
		yourName: string;
		email: string;
		tier: string;
		tierPlaceholder: string;
		description: string;
		descriptionPlaceholder: string;
		submit: string;
		success: string;
		required: string;
		invalidEmail: string;
		submitError: string;
	};
	tiers: Array<{ value: string; label: string }>;
};

export function StartupProgramForm({ translations: t, tiers }: StartupProgramFormProps) {
	const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formData, setFormData] = useState({
		startupName: "",
		contactName: "",
		email: "",
		tierInterest: "",
		description: "",
	});

	function updateField(field: string, value: string) {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const newErrors: Record<string, string> = {};
		if (!formData.startupName.trim()) newErrors.startupName = t.required;
		if (!formData.contactName.trim()) newErrors.contactName = t.required;
		if (!formData.email.trim()) newErrors.email = t.required;
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t.invalidEmail;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		setStatus("submitting");

		try {
			const res = await fetch("/api/leads/startup-program", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...formData, honeypot: "" }),
			});

			if (!res.ok) {
				setStatus("error");
				return;
			}
			setStatus("success");
			track("startup_program_submitted", { tier: formData.tier });
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
				<span style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
					{t.success}
				</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<FieldInput
					label={t.startupName}
					name="startupName"
					value={formData.startupName}
					required
					error={errors.startupName}
					onChange={(v) => updateField("startupName", v)}
				/>
				<FieldInput
					label={t.yourName}
					name="contactName"
					value={formData.contactName}
					required
					error={errors.contactName}
					onChange={(v) => updateField("contactName", v)}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FieldInput
					label={t.email}
					name="email"
					type="email"
					value={formData.email}
					required
					error={errors.email}
					onChange={(v) => updateField("email", v)}
				/>
				<div className="flex flex-col">
					<label
						htmlFor="program-tierInterest"
						className="mb-1.5 text-sm font-medium"
						style={{
							fontFamily: "var(--font-heading)",
							color: "var(--muted-foreground)",
						}}
					>
						{t.tier}
					</label>
					<div className="relative">
						<select
							id="program-tierInterest"
							name="tierInterest"
							value={formData.tierInterest}
							onChange={(e) => updateField("tierInterest", e.target.value)}
							className="w-full appearance-none rounded-[var(--radius-md)] border px-3.5 py-2.5 pr-10 transition-colors duration-150 focus:outline-none"
							style={{
								fontFamily: "var(--font-body)",
								background: "var(--background)",
								borderColor: "var(--input)",
								color: formData.tierInterest ? "var(--foreground)" : "var(--text-tertiary)",
							}}
						>
							<option value="" disabled>
								{t.tierPlaceholder}
							</option>
							{tiers.map((tier) => (
								<option key={tier.value} value={tier.value}>
									{tier.label}
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
				</div>
			</div>

			<div className="flex flex-col">
				<label
					htmlFor="program-description"
					className="mb-1.5 text-sm font-medium"
					style={{
						fontFamily: "var(--font-heading)",
						color: "var(--muted-foreground)",
					}}
				>
					{t.description}
				</label>
				<textarea
					id="program-description"
					name="description"
					value={formData.description}
					placeholder={t.descriptionPlaceholder}
					rows={4}
					onChange={(e) => updateField("description", e.target.value)}
					className="resize-y rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
					style={{
						fontFamily: "var(--font-body)",
						background: "var(--background)",
						borderColor: "var(--input)",
						color: "var(--foreground)",
					}}
				/>
			</div>

			{status === "error" && (
				<p
					className="text-sm"
					style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
					role="alert"
				>
					{t.submitError}
				</p>
			)}

			{/* Honeypot */}
			<input
				name="website_url"
				type="text"
				tabIndex={-1}
				autoComplete="off"
				className="absolute left-[-9999px] h-0 w-0 opacity-0"
				aria-hidden="true"
			/>

			<div className="mt-2 flex justify-end">
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
		</form>
	);
}

function FieldInput({
	label,
	name,
	type = "text",
	value,
	required,
	error,
	onChange,
}: {
	label: string;
	name: string;
	type?: string;
	value: string;
	required?: boolean;
	error?: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`program-${name}`}
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
				id={`program-${name}`}
				name={name}
				type={type}
				value={value}
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
