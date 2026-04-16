import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { databaseUrl } from "./env";
import * as schema from "./schema";

// HTTP-based Drizzle client. Unlike neon-serverless (which opens a WebSocket
// pool), neon-http issues one fetch per query and therefore works in any
// runtime that provides `fetch` — Vercel Edge, Cloudflare Workers, Bun, Node.
//
// Use this from per-request handlers (API routes, SSR pages). For long-lived
// workers that benefit from connection pooling, use the default `db` export
// from ./index.ts instead.
const sql = neon(databaseUrl);

export const dbHttp = drizzle(sql, { schema });

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
	sql as rawSql,
} from "drizzle-orm";
