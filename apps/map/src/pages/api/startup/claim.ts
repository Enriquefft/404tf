import type { APIRoute } from "astro";
import { claimSchema } from "@/lib/claim-schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body: unknown = await request.json();
		const result = claimSchema.safeParse(body);

		if (!result.success) {
			return new Response(JSON.stringify({ success: false, error: "Validation failed" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const data = result.data;

		// Honeypot check — reject silently
		if (data.honeypot) {
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Send notification email via Resend (non-blocking, non-failing)
		sendClaimNotification(data).catch((err: unknown) => {
			console.warn("[claim] Email notification failed:", err);
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[claim] Unexpected error:", err);
		return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

async function sendClaimNotification(data: {
	name: string;
	role: string;
	email: string;
	proof: string;
	startupSlug: string;
}): Promise<void> {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("[claim] RESEND_API_KEY not set — skipping email notification.");
		return;
	}

	const { Resend } = await import("resend");
	const resend = new Resend(apiKey);

	const rows = [
		`<tr><td style="padding:4px 8px;font-weight:600;">Startup</td><td style="padding:4px 8px;">${escapeHtml(data.startupSlug)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Name</td><td style="padding:4px 8px;">${escapeHtml(data.name)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Role</td><td style="padding:4px 8px;">${escapeHtml(data.role)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(data.email)}</td></tr>`,
		`<tr><td style="padding:4px 8px;font-weight:600;">Proof</td><td style="padding:4px 8px;">${escapeHtml(data.proof)}</td></tr>`,
	].join("");

	await resend.emails.send({
		from: "404 Mapped <notifications@404tf.com>",
		to: "enriquefft@404tf.com",
		subject: `Profile Claim: ${data.startupSlug} — ${data.name}`,
		html: `
			<h2>Profile Claim Request</h2>
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
