import { mapCorporateLeads } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { corporateLeadSchema } from "@/lib/corporate-schema";
import { db } from "@/lib/db";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body: unknown = await request.json();
		const result = corporateLeadSchema.safeParse(body);

		if (!result.success) {
			return new Response(JSON.stringify({ success: false, error: "Validation failed" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const data = result.data;

		// Honeypot check — reject if filled
		if (data.honeypot) {
			// Pretend success to not tip off bots
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Insert into database
		await db.insert(mapCorporateLeads).values({
			name: data.name,
			email: data.email,
			company: data.company ?? null,
			role: data.role ?? null,
			industry: data.industry ?? null,
			challenge: data.challenge ?? null,
			timeline: data.timeline ?? null,
			notes: data.notes ?? null,
			contextStartupSlug: data.contextStartupSlug ?? null,
		});

		// Send notification email via Resend (non-blocking, non-failing)
		await sendNotificationEmail(data).catch((err: unknown) => {
			console.warn("[corporate-lead] Email notification failed:", err);
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[corporate-lead] Unexpected error:", err);
		return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

async function sendNotificationEmail(data: {
	name: string;
	email: string;
	company?: string;
	role?: string;
	industry?: string;
	challenge?: string;
	timeline?: string;
	notes?: string;
	contextStartupSlug?: string;
}): Promise<void> {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("[corporate-lead] RESEND_API_KEY not set — skipping email notification.");
		return;
	}

	const { Resend } = await import("resend");
	const resend = new Resend(apiKey);

	const rows = [
		`<tr><td style="padding:4px 8px;font-weight:600;">Name</td><td style="padding:4px 8px;">${escapeHtml(data.name)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(data.email)}</td></tr>`,
		data.company
			? `<tr><td style="padding:4px 8px;font-weight:600;">Company</td><td style="padding:4px 8px;">${escapeHtml(data.company)}</td></tr>`
			: "",
		data.role
			? `<tr><td style="padding:4px 8px;font-weight:600;">Role</td><td style="padding:4px 8px;">${escapeHtml(data.role)}</td></tr>`
			: "",
		data.industry
			? `<tr><td style="padding:4px 8px;font-weight:600;">Industry</td><td style="padding:4px 8px;">${escapeHtml(data.industry)}</td></tr>`
			: "",
		data.challenge
			? `<tr><td style="padding:4px 8px;font-weight:600;">Challenge</td><td style="padding:4px 8px;">${escapeHtml(data.challenge)}</td></tr>`
			: "",
		data.timeline
			? `<tr><td style="padding:4px 8px;font-weight:600;">Timeline</td><td style="padding:4px 8px;">${escapeHtml(data.timeline)}</td></tr>`
			: "",
		data.notes
			? `<tr><td style="padding:4px 8px;font-weight:600;">Notes</td><td style="padding:4px 8px;">${escapeHtml(data.notes)}</td></tr>`
			: "",
		data.contextStartupSlug
			? `<tr><td style="padding:4px 8px;font-weight:600;">Context Startup</td><td style="padding:4px 8px;">${escapeHtml(data.contextStartupSlug)}</td></tr>`
			: "",
	]
		.filter(Boolean)
		.join("");

	await resend.emails.send({
		from: "404 Mapped <notifications@404tf.com>",
		to: "hello@404tf.com",
		subject: `New Corporate Lead: ${data.name} (${data.company ?? "No company"})`,
		html: `
			<h2>New Corporate Lead</h2>
			<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
				${rows}
			</table>
		`,
	});
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
