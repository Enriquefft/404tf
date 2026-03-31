import { z } from "zod";

export const reportDownloadSchema = z.object({
	name: z.string().min(1, "required"),
	email: z.email("invalid_email"),
	honeypot: z.string().max(0).optional(),
});

export type ReportDownloadData = z.infer<typeof reportDownloadSchema>;
