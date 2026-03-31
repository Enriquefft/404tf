import { z } from "zod";

export const claimSchema = z.object({
	name: z.string().min(1, "required"),
	role: z.string().min(1, "required"),
	email: z.email("invalid_email"),
	proof: z.string().min(1, "required"),
	startupSlug: z.string().min(1),
	honeypot: z.string().max(0).optional(),
});

export type ClaimData = z.infer<typeof claimSchema>;
