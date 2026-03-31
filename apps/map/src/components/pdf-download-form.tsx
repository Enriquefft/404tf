import { type FormEvent, useState } from "react";
import { track } from "@/lib/track";

type PdfDownloadFormProps = {
	translations: {
		nameLabel: string;
		namePlaceholder: string;
		emailLabel: string;
		emailPlaceholder: string;
		submit: string;
		success: string;
		privacy: string;
		required: string;
		invalidEmail: string;
		error: string;
	};
};

export function PdfDownloadForm({ translations: t }: PdfDownloadFormProps) {
	const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const name = (formData.get("name") ?? "").toString().trim();
		const email = (formData.get("email") ?? "").toString().trim();
		const honeypot = (formData.get("website_url") ?? "").toString();

		const newErrors: Record<string, string> = {};
		if (!name) newErrors.name = t.required;
		if (!email) newErrors.email = t.required;
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = t.invalidEmail;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		setStatus("submitting");

		try {
			const res = await fetch("/api/leads/report-download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, honeypot }),
			});

			if (!res.ok) {
				setStatus("error");
				return;
			}

			setStatus("success");
			track("pdf_download_submitted");
		} catch {
			setStatus("error");
		}
	}

	if (status === "success") {
		return (
			<div
				className="flex items-center gap-3 rounded-[var(--radius-md)] p-4"
				style={{ background: "var(--success-muted)" }}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
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
						fontSize: 14,
					}}
				>
					{t.success}
				</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="flex flex-1 flex-col">
					<label
						htmlFor="pdf-name"
						className="mb-1.5 text-sm font-medium"
						style={{
							fontFamily: "var(--font-heading)",
							color: "var(--muted-foreground)",
						}}
					>
						{t.nameLabel}
						<span style={{ color: "var(--destructive)" }} className="ml-0.5">
							*
						</span>
					</label>
					<input
						id="pdf-name"
						name="name"
						type="text"
						placeholder={t.namePlaceholder}
						className="rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
						style={{
							fontFamily: "var(--font-body)",
							background: "var(--background)",
							borderColor: errors.name ? "var(--destructive)" : "var(--input)",
							color: "var(--foreground)",
						}}
					/>
					{errors.name && (
						<p
							className="mt-1 text-sm"
							style={{
								color: "var(--destructive)",
								fontFamily: "var(--font-body)",
							}}
							role="alert"
						>
							{errors.name}
						</p>
					)}
				</div>

				<div className="flex flex-1 flex-col">
					<label
						htmlFor="pdf-email"
						className="mb-1.5 text-sm font-medium"
						style={{
							fontFamily: "var(--font-heading)",
							color: "var(--muted-foreground)",
						}}
					>
						{t.emailLabel}
						<span style={{ color: "var(--destructive)" }} className="ml-0.5">
							*
						</span>
					</label>
					<input
						id="pdf-email"
						name="email"
						type="email"
						placeholder={t.emailPlaceholder}
						className="rounded-[var(--radius-md)] border px-3.5 py-2.5 transition-colors duration-150 focus:outline-none"
						style={{
							fontFamily: "var(--font-body)",
							background: "var(--background)",
							borderColor: errors.email ? "var(--destructive)" : "var(--input)",
							color: "var(--foreground)",
						}}
					/>
					{errors.email && (
						<p
							className="mt-1 text-sm"
							style={{
								color: "var(--destructive)",
								fontFamily: "var(--font-body)",
							}}
							role="alert"
						>
							{errors.email}
						</p>
					)}
				</div>

				{/* Honeypot */}
				<input
					name="website_url"
					type="text"
					tabIndex={-1}
					autoComplete="off"
					className="absolute left-[-9999px] h-0 w-0 opacity-0"
					aria-hidden="true"
				/>

				<div className="flex items-end">
					<button
						type="submit"
						disabled={status === "submitting"}
						className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 font-semibold transition-all duration-150 ease-out disabled:opacity-50"
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

			{status === "error" && (
				<p
					className="text-sm"
					style={{
						color: "var(--destructive)",
						fontFamily: "var(--font-body)",
					}}
					role="alert"
				>
					{t.error}
				</p>
			)}

			<p
				className="text-xs"
				style={{
					color: "var(--text-tertiary)",
					fontFamily: "var(--font-body)",
				}}
			>
				{t.privacy}
			</p>
		</form>
	);
}
