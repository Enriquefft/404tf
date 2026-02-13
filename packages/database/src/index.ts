import { drizzle } from "drizzle-orm/neon-serverless";
import { databaseUrl } from "./env";
import * as schema from "./schema";

export const db = drizzle(databaseUrl, { schema });
