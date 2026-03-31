import { mapReportDownloads } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { reportDownloadSchema } from "@/lib/report-download-schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body: unknown = await request.json();
		const result = reportDownloadSchema.safeParse(body);

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

		await db.insert(mapReportDownloads).values({
			name: data.name,
			email: data.email,
		});

		await sendNotificationEmail(data).catch((err: unknown) => {
			console.warn("[report-download] Email notification failed:", err);
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[report-download] Unexpected error:", err);
		return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

async function sendNotificationEmail(data: { name: string; email: string }): Promise<void> {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("[report-download] RESEND_API_KEY not set — skipping email notification.");
		return;
	}

	const { Resend } = await import("resend");
	const resend = new Resend(apiKey);

	await resend.emails.send({
		from: "404 Mapped <notifications@404tf.com>",
		to: "hello@404tf.com",
		subject: `Report Download: ${data.name}`,
		html: `
			<h2>New Report Download Request</h2>
			<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
				<tr><td style="padding:4px 8px;font-weight:600;">Name</td><td style="padding:4px 8px;">${escapeHtml(data.name)}</td></tr>
				<tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(data.email)}</td></tr>
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
