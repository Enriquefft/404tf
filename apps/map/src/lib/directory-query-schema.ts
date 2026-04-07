import { mapMaturityEnum, mapVerticalEnum } from "@404tf/database/schema";
import { z } from "zod";

// Derive enum tuples from the Drizzle pgEnums so the API validation cannot
// drift from the DB schema. Single source of truth.
const verticalValues = mapVerticalEnum.enumValues;
const maturityValues = mapMaturityEnum.enumValues;

export const directoryQuerySchema = z.object({
	q: z.string().max(100).optional().default(""),
	// Comma-separated list — supports the multi-select UI in directory-island.
	verticals: z
		.string()
		.optional()
		.default("")
		.transform((s) => (s ? s.split(",").filter(Boolean) : []))
		.pipe(z.array(z.enum(verticalValues))),
	country: z.string().max(80).optional().default(""),
	maturity: z
		.union([z.enum(maturityValues), z.literal("")])
		.optional()
		.default(""),
	sort: z.enum(["az", "newest"]).optional().default("az"),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(50).optional().default(20),
	locale: z.enum(["es", "en"]).optional().default("es"),
});

export type DirectoryQuery = z.infer<typeof directoryQuerySchema>;

// Response shape — used by both the API route and the client fetch validator.
export const directoryStartupSchema = z.object({
	slug: z.string(),
	name: z.string(),
	one_liner: z.string().nullable(),
	one_liner_en: z.string().nullable(),
	country: z.string(),
	country_es: z.string().nullable(),
	city: z.string().nullable(),
	lat: z.number(),
	lng: z.number(),
	verticals: z.array(z.enum(verticalValues)),
	maturity_level: z.enum(maturityValues),
	founding_year: z.number().int().nullable(),
	funding_received: z.string().nullable(),
});

export const directoryResponseSchema = z.object({
	data: z.array(directoryStartupSchema),
	total: z.number().int().min(0),
	page: z.number().int().min(1),
	totalPages: z.number().int().min(0),
});

export type DirectoryResponse = z.infer<typeof directoryResponseSchema>;
export type DirectoryStartup = z.infer<typeof directoryStartupSchema>;
