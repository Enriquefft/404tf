import { mapStartupProgramInquiries } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { startupProgramSchema } from "@/lib/startup-program-schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body: unknown = await request.json();
		const result = startupProgramSchema.safeParse(body);

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

		await db.insert(mapStartupProgramInquiries).values({
			startupName: data.startupName,
			contactName: data.contactName,
			email: data.email,
			tierInterest: data.tierInterest ?? null,
			description: data.description ?? null,
		});

		sendNotificationEmail(data).catch((err: unknown) => {
			console.warn("[startup-program] Email notification failed:", err);
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[startup-program] Unexpected error:", err);
		return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

async function sendNotificationEmail(data: {
	startupName: string;
	contactName: string;
	email: string;
	tierInterest?: string;
	description?: string;
}): Promise<void> {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("[startup-program] RESEND_API_KEY not set — skipping email notification.");
		return;
	}

	const { Resend } = await import("resend");
	const resend = new Resend(apiKey);

	const rows = [
		`<tr><td style="padding:4px 8px;font-weight:600;">Startup</td><td style="padding:4px 8px;">${escapeHtml(data.startupName)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Contact</td><td style="padding:4px 8px;">${escapeHtml(data.contactName)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(data.email)}</td></tr>`,
		data.tierInterest
			? `<tr><td style="padding:4px 8px;font-weight:600;">Tier</td><td style="padding:4px 8px;">${escapeHtml(data.tierInterest)}</td></tr>`
			: "",
		data.description
			? `<tr><td style="padding:4px 8px;font-weight:600;">Description</td><td style="padding:4px 8px;">${escapeHtml(data.description)}</td></tr>`
			: "",
	]
		.filter(Boolean)
		.join("");

	await resend.emails.send({
		from: "404 Mapped <notifications@404tf.com>",
		to: "hello@404tf.com",
		subject: `New Program Inquiry: ${data.startupName} (${data.tierInterest ?? "No tier"})`,
		html: `
			<h2>New Startup Program Inquiry</h2>
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
