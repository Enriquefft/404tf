// Single DB client for the map app. Uses `@404tf/database/http` (neon-http)
// so the same client works from Vercel Edge, Node SSR, Bun build scripts, and
// local `bun run` tasks without needing a websocket pool.
//
// Every request-time handler (API route, SSR page) should import `db` from
// here and call Drizzle query builders — no raw SQL, no direct neon() usage.
// Re-exports the minimum operator surface used across the app so consumers
// never need to depend on `drizzle-orm` directly.

export {
	and,
	arrayContains,
	asc,
	count,
	dbHttp as db,
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
	rawSql as sql,
} from "@404tf/database/http";
export type {
	MapCorporateLead,
	MapReportDownload,
	MapStartup,
	MapStartupApplication,
	MapStartupProgramInquiry,
	NewMapCorporateLead,
	NewMapReportDownload,
	NewMapStartup,
	NewMapStartupApplication,
	NewMapStartupProgramInquiry,
} from "@404tf/database/schema";
export {
	mapCorporateLeads,
	mapReportDownloads,
	mapStartupApplications,
	mapStartupProgramInquiries,
	mapStartups,
} from "@404tf/database/schema";
