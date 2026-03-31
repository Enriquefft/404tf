import { type FormEvent, useState } from "react";
import { track } from "@/lib/track";

type ClaimFormProps = {
	startupSlug: string;
	startupName: string;
	translations: {
		title: string;
		nameLabel: string;
		namePlaceholder: string;
		roleLabel: string;
		rolePlaceholder: string;
		emailLabel: string;
		emailPlaceholder: string;
		proofLabel: string;
		proofPlaceholder: string;
		submit: string;
		submitting: string;
		success: string;
		required: string;
		invalidEmail: string;
		submitError: string;
	};
};

export function ClaimForm({ startupSlug, startupName, translations: t }: ClaimFormProps) {
	const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const fd = new FormData(form);

		const name = (fd.get("name") ?? "").toString().trim();
		const role = (fd.get("role") ?? "").toString().trim();
		const email = (fd.get("email") ?? "").toString().trim();
		const proof = (fd.get("proof") ?? "").toString().trim();
		const honeypot = (fd.get("website_url") ?? "").toString();

		const newErrors: Record<string, string> = {};
		if (!name) newErrors.name = t.required;
		if (!role) newErrors.role = t.required;
		if (!email) newErrors.email = t.required;
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = t.invalidEmail;
		}
		if (!proof) newErrors.proof = t.required;

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		setStatus("submitting");

		try {
			const res = await fetch("/api/startup/claim", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					role,
					email,
					proof,
					startupSlug,
					honeypot,
				}),
			});

			if (!res.ok) {
				setStatus("error");
				return;
			}
			setStatus("success");
			track("claim_submitted", { startup: startupSlug });
		} catch {
			setStatus("error");
		}
	}

	if (status === "success") {
		return (
			<div
				className="flex items-center gap-3 rounded-[var(--radius-md)] p-6"
				style={{ background: "var(--success-muted)" }}
				role="status"
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

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<h3
				className="text-base font-semibold"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--foreground)",
				}}
			>
				{t.title.replace("{name}", startupName)}
			</h3>

			{/* Honeypot */}
			<div className="absolute -left-[9999px]" aria-hidden="true">
				<label htmlFor="claim-website-url">Website</label>
				<input
					type="text"
					id="claim-website-url"
					name="website_url"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<FieldInput
				label={t.nameLabel}
				name="name"
				placeholder={t.namePlaceholder}
				required
				error={errors.name}
			/>

			<FieldInput
				label={t.roleLabel}
				name="role"
				placeholder={t.rolePlaceholder}
				required
				error={errors.role}
			/>

			<FieldInput
				label={t.emailLabel}
				name="email"
				type="email"
				placeholder={t.emailPlaceholder}
				required
				error={errors.email}
			/>

			<FieldTextarea
				label={t.proofLabel}
				name="proof"
				placeholder={t.proofPlaceholder}
				required
				error={errors.proof}
				rows={3}
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

			<div className="flex justify-end">
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
					{status === "submitting" ? t.submitting : t.submit}
				</button>
			</div>
		</form>
	);
}

function FieldInput({
	label,
	name,
	type = "text",
	placeholder,
	required,
	error,
}: {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`claim-${name}`}
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
				id={`claim-${name}`}
				name={name}
				type={type}
				placeholder={placeholder}
				className="min-h-11 rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
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

function FieldTextarea({
	label,
	name,
	placeholder,
	required,
	error,
	rows = 3,
}: {
	label: string;
	name: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	rows?: number;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={`claim-${name}`}
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
			<textarea
				id={`claim-${name}`}
				name={name}
				placeholder={placeholder}
				rows={rows}
				className="min-h-11 resize-y rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
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
