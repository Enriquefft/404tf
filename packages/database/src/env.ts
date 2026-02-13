import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const neonUrlSchema = z
	.string()
	.url()
	.startsWith("postgresql://", "Database URL must be a PostgreSQL connection string")
	.refine(
		(url) => {
			try {
				const parsed = new URL(url);
				return parsed.username && parsed.password && parsed.hostname;
			} catch {
				return false;
			}
		},
		{ message: "Invalid database URL format: missing credentials or hostname" },
	);

export const dbEnv = createEnv({
	client: {},
	emptyStringAsUndefined: true,
	experimental__runtimeEnv: process.env,
	isServer: true,
	server: {
		DATABASE_URL: neonUrlSchema,
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	},
});

export const databaseUrl = dbEnv.DATABASE_URL;
