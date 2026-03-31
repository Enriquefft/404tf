import { z } from "zod";

export const directoryQuerySchema = z.object({
	q: z.string().max(100).optional().default(""),
	vertical: z.string().optional().default(""),
	country: z.string().optional().default(""),
	maturity: z.string().optional().default(""),
	sort: z.enum(["az", "newest"]).optional().default("az"),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(50).optional().default(20),
	locale: z.enum(["es", "en"]).optional().default("es"),
});

export type DirectoryQuery = z.infer<typeof directoryQuerySchema>;
