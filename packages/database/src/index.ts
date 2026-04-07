import { drizzle } from "drizzle-orm/neon-serverless";
import { databaseUrl } from "./env";
import * as schema from "./schema";

export const db = drizzle(databaseUrl, { schema });

// Re-export query operators so consuming apps depend on a single drizzle-orm
// version (this package's). Apps must NOT add `drizzle-orm` as a direct dep.
export {
	and,
	arrayContains,
	asc,
	count,
	desc,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	like,
	lt,
	lte,
	ne,
	not,
	or,
	sql,
} from "drizzle-orm";
