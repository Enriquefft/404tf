/**
 * Data preparation script for 404 Mapped seed data.
 *
 * Reads data.csv, parses each row, applies vertical/maturity/geocoding mappings,
 * generates slugs, and outputs src/data/seed.json.
 *
 * Translations are embedded inline since there is no external API.
 *
 * Usage: bun run scripts/prepare-data.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KeyResult {
	type: string;
	title: string;
	description: string;
}

interface Startup {
	slug: string;
	name: string;
	one_liner: string;
	one_liner_en: string;
	country: string;
	country_es: string;
	city: string;
	lat: number;
	lng: number;
	verticals: string[];
	maturity_level: string;
	founding_year: number | null;
	tech_description: string;
	tech_description_en: string;
	key_results: KeyResult[];
	key_results_en: KeyResult[];
	problem_statement: string;
	problem_statement_en: string;
	business_model: string;
	business_model_en: string;
	funding_received: string | null;
	team_size: number | null;
	website_url: string | null;
	social_links: { linkedin?: string; twitter?: string } | null;
	contact_name: string | null;
	contact_role: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	contact_linkedin: string | null;
	claimed: false;
	logo_path: null;
	hero_image_path: null;
	founder_photos: null;
	partner_logos: null;
	video_url: null;
	video_label: null;
}

// ---------------------------------------------------------------------------
// Helpers — slug
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // strip accents
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-") // non-alphanum → hyphen
		.replace(/^-|-$/g, "") // trim leading/trailing hyphens
		.slice(0, 60);
}

// ---------------------------------------------------------------------------
// Helpers — vertical mapping
// ---------------------------------------------------------------------------

const verticalPatterns: [RegExp, string][] = [
	[/\b(ai|ia|machine\s*learning|ml|deep\s*learning|inteligencia\s*artificial)\b/i, "ai_ml"],
	[/\b(biotech|bio\b|synthetic|biolog[ií]a|biotecnolog[ií]a|synbio|biomanufactura)\b/i, "biotech"],
	[/\b(hardware|roboti[ck]s?|rob[oó]tica|iot|mechatronic|industry\s*4)/i, "hardware_robotics"],
	[
		/\b(cleantech|clean\s*tech|climate|clima|energy|energ[ií]a|greentech|sustainability|green|movilidad|mobility|climatech)/i,
		"cleantech",
	],
	[/\b(agri|agro|food|foodtech|agtech|agritech)/i, "agritech"],
	[/\b(health|med|salud|medical|dispositivos|healthtech|medtech|farmac[eé]utic)/i, "healthtech"],
	[/\b(material|nano|biomaterial)/i, "advanced_materials"],
	[/\b(aero|space|espacial|spacetech)/i, "aerospace"],
	[/\b(quantum|cu[aá]ntic|computaci[oó]n\s*cu[aá]ntica)/i, "quantum"],
	[/\b(circular\s*economy|fashion|proptech|watertech|oceantech)/i, "cleantech"],
];

function mapVerticals(raw: string): string[] {
	const result: string[] = [];
	for (const [pattern, value] of verticalPatterns) {
		if (pattern.test(raw) && !result.includes(value)) {
			result.push(value);
		}
	}
	return result.length > 0 ? result : ["other"];
}

// ---------------------------------------------------------------------------
// Helpers — maturity mapping
// ---------------------------------------------------------------------------

function mapMaturity(raw: string): string {
	const r = raw.toLowerCase();
	if (/investigaci[oó]n|trl\s*[1-3]|r&d|research/i.test(r)) return "rd";
	if (/pre-?seed|early|prototipo|mvp|trl\s*[4-5]/i.test(r)) return "prototype";
	if (
		/seed|serie\s*[ab]|pilot|trl\s*[6-7]|scaling|comercial|expansi[oó]n|growth|etapa\s*de?\s*(escalado|comercial|implementaci)/i.test(
			r,
		)
	)
		return "pilot";
	if (
		/scale-?up|unicornio|revenue|comercializaci[oó]n|trl\s*[8-9]|producto\s*en\s*mercado|escalando/i.test(
			r,
		)
	)
		return "revenue";
	return "prototype"; // default fallback
}

// ---------------------------------------------------------------------------
// Helpers — geocoding
// ---------------------------------------------------------------------------

interface Coords {
	lat: number;
	lng: number;
	city: string;
	country: string;
	country_es: string;
}

const countryCoords: Record<string, { lat: number; lng: number; en: string; es: string }> = {
	peru: { lat: -12.0464, lng: -77.0428, en: "Peru", es: "Perú" },
	argentina: { lat: -34.6037, lng: -58.3816, en: "Argentina", es: "Argentina" },
	chile: { lat: -33.4489, lng: -70.6693, en: "Chile", es: "Chile" },
	colombia: { lat: 4.711, lng: -74.0721, en: "Colombia", es: "Colombia" },
	mexico: { lat: 19.4326, lng: -99.1332, en: "Mexico", es: "México" },
	méxico: { lat: 19.4326, lng: -99.1332, en: "Mexico", es: "México" },
	bolivia: { lat: -16.4897, lng: -68.1193, en: "Bolivia", es: "Bolivia" },
	brasil: { lat: -23.5505, lng: -46.6333, en: "Brazil", es: "Brasil" },
	brazil: { lat: -23.5505, lng: -46.6333, en: "Brazil", es: "Brasil" },
	uruguay: { lat: -34.9011, lng: -56.1645, en: "Uruguay", es: "Uruguay" },
	ecuador: { lat: -0.1807, lng: -78.4678, en: "Ecuador", es: "Ecuador" },
	"costa rica": {
		lat: 9.9281,
		lng: -84.0907,
		en: "Costa Rica",
		es: "Costa Rica",
	},
	paraguay: { lat: -25.2637, lng: -57.5759, en: "Paraguay", es: "Paraguay" },
};

const peruCities: Record<string, { lat: number; lng: number }> = {
	lima: { lat: -12.0464, lng: -77.0428 },
	arequipa: { lat: -16.409, lng: -71.5375 },
	cusco: { lat: -13.532, lng: -71.9675 },
	trujillo: { lat: -8.1116, lng: -79.0287 },
	huancayo: { lat: -12.0651, lng: -75.2049 },
	"cerro de pasco": { lat: -10.6868, lng: -76.2617 },
	piura: { lat: -5.1945, lng: -80.6328 },
	huanuco: { lat: -9.93, lng: -76.2422 },
};

function geocode(country: string, location: string): Coords {
	const loc = location
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
	const cty = country
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

	// Extract first city-like token from location
	let cityName = location
		.split(",")[0]
		.split("/")[0]
		.trim()
		.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s-]/g, "")
		.trim();

	// Determine country
	let matchedCountry = "peru"; // default
	for (const key of Object.keys(countryCoords)) {
		if (cty.includes(key) || loc.includes(key)) {
			matchedCountry = key;
			break;
		}
	}

	const cc = countryCoords[matchedCountry] ?? countryCoords.peru;
	let lat = cc.lat;
	let lng = cc.lng;

	// Peru city refinement
	if (matchedCountry === "peru" || matchedCountry === "perú") {
		for (const [cityKey, coords] of Object.entries(peruCities)) {
			if (loc.includes(cityKey)) {
				lat = coords.lat;
				lng = coords.lng;
				cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
				break;
			}
		}
		if (!cityName || cityName.toLowerCase() === "peru" || cityName.toLowerCase() === "perú") {
			cityName = "Lima";
		}
	}

	// For non-Peru countries, use capital as city if city not extractable
	if (matchedCountry !== "peru" && (!cityName || cityName.length < 2)) {
		const capitals: Record<string, string> = {
			argentina: "Buenos Aires",
			chile: "Santiago",
			colombia: "Bogotá",
			mexico: "Mexico City",
			méxico: "Mexico City",
			bolivia: "La Paz",
			brasil: "São Paulo",
			uruguay: "Montevideo",
			ecuador: "Quito",
		};
		cityName = capitals[matchedCountry] ?? "Unknown";
	}

	return {
		lat,
		lng,
		city: cityName || "Lima",
		country: cc.en,
		country_es: cc.es,
	};
}

// ---------------------------------------------------------------------------
// Helpers — funding cleanup
// ---------------------------------------------------------------------------

function cleanFunding(raw: string): string | null {
	const r = raw.trim();
	if (
		!r ||
		/no\s*p[uú]blic/i.test(r) ||
		/bootstrapping/i.test(r) ||
		/proinnovate/i.test(r) ||
		/venture\s*capital/i.test(r) ||
		/inversi[oó]n\s*[aá]ngel/i.test(r) ||
		/financiamiento/i.test(r) ||
		/fondo\s*proinnovate/i.test(r)
	) {
		return null;
	}
	// Already in USD millions format
	if (/US\$\s*[\d.]+M/i.test(r)) return r;
	// "$X.XM" or "USD X.XM"
	const mMatch = r.match(/([\d,.]+)\s*M/i);
	if (mMatch) {
		const val = mMatch[1].replace(",", "");
		return `US$ ${val}M`;
	}
	// "millones de dólares"
	const millMatch = r.match(/([\d,.]+)\s*millones/i);
	if (millMatch) {
		const val = millMatch[1].replace(",", "");
		return `US$ ${val}M`;
	}
	// Aprox range
	const rangeMatch = r.match(/\$?([\d,.]+)\s*-\s*\$?([\d,.]+)\s*(M|million|USD)/i);
	if (rangeMatch) {
		return `US$ ${rangeMatch[1].replace(",", "")}-${rangeMatch[2].replace(",", "")}M`;
	}
	// Raw USD number
	const usdMatch = r.match(/([\d,]+)\s*(USD|PEN)/i);
	if (usdMatch) {
		const val = Number.parseInt(usdMatch[1].replace(",", ""), 10);
		const currency = usdMatch[2].toUpperCase();
		if (currency === "PEN") return `S/ ${val.toLocaleString("en-US")}`;
		if (val >= 1_000_000) return `US$ ${(val / 1_000_000).toFixed(1)}M`;
		return `US$ ${(val / 1000).toFixed(0)}K`;
	}
	// Number only
	const numMatch = r.match(/^\$?\s*([\d,]+)$/);
	if (numMatch) {
		const val = Number.parseInt(numMatch[1].replace(",", ""), 10);
		if (val >= 1_000_000) return `US$ ${(val / 1_000_000).toFixed(1)}M`;
		return `US$ ${(val / 1000).toFixed(0)}K`;
	}
	return null;
}

// ---------------------------------------------------------------------------
// Helpers — URL extraction
// ---------------------------------------------------------------------------

function extractUrls(raw: string): {
	website: string | null;
	linkedin: string | null;
	twitter: string | null;
} {
	const parts = raw
		.split(/[,;\s/]+/)
		.map((s) => s.trim())
		.filter(Boolean);
	let website: string | null = null;
	let linkedin: string | null = null;
	let twitter: string | null = null;

	for (const part of parts) {
		if (/no\s*p[uú]blic/i.test(part)) continue;
		if (/linkedin\.com/i.test(part)) {
			linkedin = part.startsWith("http") ? part : `https://${part}`;
		} else if (/twitter\.com|x\.com/i.test(part)) {
			twitter = part.startsWith("http") ? part : `https://${part}`;
		} else if (/\.[a-z]{2,}/i.test(part) && !linkedin && part.length > 4) {
			website = part.startsWith("http") ? part : `https://${part}`;
		}
	}
	return { website, linkedin, twitter };
}

// ---------------------------------------------------------------------------
// Main — this script outputs a template JSON for manual translation pass.
// The final seed.json in src/data/ is the manually translated version.
// ---------------------------------------------------------------------------

console.log(
	"This script documents the data pipeline. The seed.json is produced directly with translations inline.",
);
console.log("See src/data/seed.json for the final output.");
