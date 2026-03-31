import { z } from "zod";

export const startupApplyStep1Schema = z.object({
	startupName: z.string().min(1, "required"),
	website: z.string().url("invalid_url").or(z.literal("")),
	contactName: z.string().min(1, "required"),
	contactRole: z.string().optional(),
	email: z.email("invalid_email"),
});

export const startupApplyStep2Schema = z.object({
	country: z.string().min(1, "required"),
	vertical: z.string().min(1, "required"),
	maturity: z.string().min(1, "required"),
	oneLiner: z.string().max(200, "max_200").optional(),
	pitch: z.string().optional(),
});

export const startupApplySchema = startupApplyStep1Schema.merge(startupApplyStep2Schema).extend({
	honeypot: z.string().max(0).optional(),
});

export type StartupApplyData = z.infer<typeof startupApplySchema>;
