import { z } from "zod";

export const TIER_OPTIONS = ["assess", "prepare", "connect", "not_sure"] as const;

export const startupProgramSchema = z.object({
	startupName: z.string().min(1, "required"),
	contactName: z.string().min(1, "required"),
	email: z.email("invalid_email"),
	tierInterest: z.string().optional(),
	description: z.string().optional(),
	honeypot: z.string().max(0).optional(),
});

export type StartupProgramData = z.infer<typeof startupProgramSchema>;
