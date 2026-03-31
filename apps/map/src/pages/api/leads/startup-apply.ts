import { mapStartupApplications } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { startupApplySchema } from "@/lib/startup-apply-schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body: unknown = await request.json();
		const result = startupApplySchema.safeParse(body);

		if (!result.success) {
			return new Response(JSON.stringify({ success: false, error: "Validation failed" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const data = result.data;

		// Honeypot check
		if (data.honeypot) {
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		await db.insert(mapStartupApplications).values({
			startupName: data.startupName,
			website: data.website || null,
			contactName: data.contactName,
			contactRole: data.contactRole ?? null,
			email: data.email,
			country: data.country || null,
			vertical: data.vertical || null,
			maturity: data.maturity || null,
			oneLiner: data.oneLiner ?? null,
			pitch: data.pitch ?? null,
		});

		sendNotificationEmail(data).catch((err: unknown) => {
			console.warn("[startup-apply] Email notification failed:", err);
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[startup-apply] Unexpected error:", err);
		return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

async function sendNotificationEmail(data: {
	startupName: string;
	email: string;
	contactName: string;
	contactRole?: string;
	website?: string;
	country?: string;
	vertical?: string;
	maturity?: string;
	oneLiner?: string;
	pitch?: string;
}): Promise<void> {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("[startup-apply] RESEND_API_KEY not set — skipping email notification.");
		return;
	}

	const { Resend } = await import("resend");
	const resend = new Resend(apiKey);

	const rows = [
		`<tr><td style="padding:4px 8px;font-weight:600;">Startup</td><td style="padding:4px 8px;">${escapeHtml(data.startupName)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Contact</td><td style="padding:4px 8px;">${escapeHtml(data.contactName)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(data.email)}</td></tr>`,
		data.contactRole
			? `<tr><td style="padding:4px 8px;font-weight:600;">Role</td><td style="padding:4px 8px;">${escapeHtml(data.contactRole)}</td></tr>`
			: "",
		data.website
			? `<tr><td style="padding:4px 8px;font-weight:600;">Website</td><td style="padding:4px 8px;">${escapeHtml(data.website)}</td></tr>`
			: "",
		data.country
			? `<tr><td style="padding:4px 8px;font-weight:600;">Country</td><td style="padding:4px 8px;">${escapeHtml(data.country)}</td></tr>`
			: "",
		data.vertical
			? `<tr><td style="padding:4px 8px;font-weight:600;">Vertical</td><td style="padding:4px 8px;">${escapeHtml(data.vertical)}</td></tr>`
			: "",
		data.maturity
			? `<tr><td style="padding:4px 8px;font-weight:600;">Maturity</td><td style="padding:4px 8px;">${escapeHtml(data.maturity)}</td></tr>`
			: "",
		data.oneLiner
			? `<tr><td style="padding:4px 8px;font-weight:600;">One-liner</td><td style="padding:4px 8px;">${escapeHtml(data.oneLiner)}</td></tr>`
			: "",
		data.pitch
			? `<tr><td style="padding:4px 8px;font-weight:600;">Pitch</td><td style="padding:4px 8px;">${escapeHtml(data.pitch)}</td></tr>`
			: "",
	]
		.filter(Boolean)
		.join("");

	await resend.emails.send({
		from: "404 Mapped <notifications@404tf.com>",
		to: "hello@404tf.com",
		subject: `New Startup Application: ${data.startupName}`,
		html: `
			<h2>New Startup Application</h2>
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
