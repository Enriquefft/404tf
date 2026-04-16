import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CorporateModal } from "@/components/corporate-modal";
import type { Locale } from "@/i18n/translations";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { directoryResponseSchema } from "@/lib/directory-query-schema";
import { AMERICAS_POINTS, COUNTRY_LABELS, LATAM_POINTS, projectToSvg } from "@/lib/map-points";
import {
	MATURITY_KEYS,
	type MaturityKey,
	VERTICAL_KEYS,
	type VerticalKey,
} from "@/lib/startup-schema";
import { track } from "@/lib/track";
import { MATURITY_CONFIG, VERTICAL_CONFIG } from "@/lib/verticals";

// ---- Types ----

// Derived from the Zod response schema (which itself derives enum tuples
// from the Drizzle pgEnum) so the runtime parse and the compile-time props
// share a single source of truth.
import type { DirectoryStartup } from "@/lib/directory-query-schema";

type StartupData = DirectoryStartup;

type MapPoint = {
	slug: string;
	lat: number;
	lng: number;
	verticals: VerticalKey[];
	country: string;
};

type DirectoryLabels = {
	searchPlaceholder: string;
	filterCountryAll: string;
	filterMaturityAll: string;
	clearAll: string;
	showingOf: string;
	sortLabel: string;
	sortAZ: string;
	sortNewest: string;
	emptyTitle: string;
	emptyMessage: string;
	showMap: string;
	hideMap: string;
	ctaFindSolution: string;
	heroKickerPrefix: string;
	heroKickerStartups: string;
	heroKickerCountries: string;
	heroHeadline: string;
	heroDescriptor: string;
	tabAll: string;
	tabPilotReady: string;
	tabRaising: string;
	tabNew: string;
	tabStealth: string;
	resultShowing: string;
	resultFilteredBy: string;
	resultNone: string;
	loadMore: string;
	floatingKicker: string;
	floatingLabel: string;
	mobileCtaKicker: string;
	emptyKicker: string;
	emptyHeadline: string;
	emptyContactCta: string;
	quickBookIntro: string;
	quickSave: string;
	quickSaved: string;
	quickShare: string;
	quickShared: string;
};

type DirectoryIslandProps = {
	initialStartups: StartupData[];
	totalCount: number;
	countriesCount: number;
	mapPoints: MapPoint[];
	locale: Locale;
	labels: DirectoryLabels;
	startupBaseHref: string;
	contactHref: string;
};

type SortKey = "az" | "newest";
type TabKey = "all" | "pilot" | "raising" | "new" | "stealth";

// ---- CSS-variable-safe color map ----

const V_RAW_COLORS: Record<string, string> = {
	ai_ml: "#ff2898",
	biotech: "#00cd4e",
	hardware_robotics: "#ff4834",
	cleantech: "#2dd4bf",
	agritech: "#a3e635",
	healthtech: "#f87171",
	advanced_materials: "#a78bfa",
	aerospace: "#38bdf8",
	quantum: "#d946ef",
	other: "#94a3b8",
};

const V_MUTED_COLORS: Record<string, string> = {
	ai_ml: "rgba(255,40,152,0.15)",
	biotech: "rgba(0,205,78,0.15)",
	hardware_robotics: "rgba(255,72,52,0.15)",
	cleantech: "rgba(45,212,191,0.15)",
	agritech: "rgba(163,230,53,0.15)",
	healthtech: "rgba(248,113,113,0.15)",
	advanced_materials: "rgba(167,139,250,0.15)",
	aerospace: "rgba(56,189,248,0.15)",
	quantum: "rgba(217,70,239,0.15)",
	other: "rgba(148,163,184,0.15)",
};

function getVColor(key: string): string {
	return V_RAW_COLORS[key] ?? V_RAW_COLORS.other;
}

function getVMuted(key: string): string {
	return V_MUTED_COLORS[key] ?? V_MUTED_COLORS.other;
}

// ---- SVG Map constants ----

const MAP_W = 900;
const MAP_H = 500;

const SAVED_KEY = "404tf-map-saved";

// ---- Type guards (avoid `as` casts at index sites) ----

function isMaturityKey(k: string): k is MaturityKey {
	return Object.hasOwn(MATURITY_CONFIG, k);
}

// ---- Component ----

export function DirectoryIsland({
	initialStartups,
	totalCount,
	countriesCount,
	mapPoints,
	locale,
	labels,
	startupBaseHref,
	contactHref,
}: DirectoryIslandProps) {
	// ---- State ----
	const [search, setSearch] = useState("");
	const [selectedVerticals, setSelectedVerticals] = useState<Set<VerticalKey>>(new Set());
	const [selectedCountry, setSelectedCountry] = useState<string>("");
	const [selectedMaturity, setSelectedMaturity] = useState<string>("");
	const [sort, setSort] = useState<SortKey>("az");
	const [showMap, setShowMap] = useState(true);
	const [hoveredStartup, setHoveredStartup] = useState<string | null>(null);
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
	const [corporateOpen, setCorporateOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>("all");
	const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
	const [sharedSlug, setSharedSlug] = useState<string | null>(null);
	const [ctaVisible, setCtaVisible] = useState(true);

	// API-driven state
	const [startups, setStartups] = useState<StartupData[]>(initialStartups);
	const [total, setTotal] = useState(totalCount);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const prevFiltersKey = useRef<string>("");

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
	const mapSvgRef = useRef<SVGSVGElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	// ---- Load saved from localStorage ----
	useEffect(() => {
		try {
			const raw = localStorage.getItem(SAVED_KEY);
			if (raw) {
				const parsed: unknown = JSON.parse(raw);
				if (Array.isArray(parsed) && parsed.every((v): v is string => typeof v === "string")) {
					setSavedSlugs(new Set(parsed));
				}
			}
		} catch {
			/* localStorage unavailable — non-fatal */
		}
	}, []);

	function persistSaved(next: Set<string>) {
		try {
			localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
		} catch {
			/* non-fatal */
		}
	}

	function toggleSaved(slug: string) {
		setSavedSlugs((prev) => {
			const next = new Set(prev);
			if (next.has(slug)) next.delete(slug);
			else next.add(slug);
			persistSaved(next);
			return next;
		});
	}

	async function handleShare(slug: string) {
		const url = `${window.location.origin}${startupBaseHref}${slug}`;
		try {
			await navigator.clipboard.writeText(url);
			setSharedSlug(slug);
			setTimeout(() => setSharedSlug((cur) => (cur === slug ? null : cur)), 1500);
			track("directory_share", { slug });
		} catch {
			/* clipboard unavailable — silently fall back */
		}
	}

	const handleSearchInput = useCallback((value: string) => {
		setSearch(value);
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearch(value);
			if (value) track("directory_search", { query: value });
		}, 300);
	}, []);

	// ---- Fetch from API when filters or page change ----

	const hasFiltersActive =
		debouncedSearch !== "" ||
		selectedVerticals.size > 0 ||
		selectedCountry !== "" ||
		selectedMaturity !== "";

	useEffect(() => {
		const filtersKey = JSON.stringify({
			q: debouncedSearch,
			v: [...selectedVerticals].sort(),
			c: selectedCountry,
			m: selectedMaturity,
			s: sort,
		});
		const filtersChanged = filtersKey !== prevFiltersKey.current;
		prevFiltersKey.current = filtersKey;

		if (filtersChanged && page !== 1) {
			setPage(1);
			return;
		}

		if (!hasFiltersActive && sort === "az" && page === 1) {
			setStartups(initialStartups);
			setTotal(totalCount);
			setFetchError(null);
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		setFetchError(null);

		const params = new URLSearchParams();
		if (debouncedSearch) params.set("q", debouncedSearch);
		if (selectedVerticals.size > 0) {
			params.set("verticals", [...selectedVerticals].join(","));
		}
		if (selectedCountry) params.set("country", selectedCountry);
		if (selectedMaturity) params.set("maturity", selectedMaturity);
		params.set("sort", sort);
		params.set("page", String(page));
		params.set("limit", "20");
		params.set("locale", locale);

		fetch(`/api/directory?${params}`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(`API returned ${res.status}`);
				}
				const json: unknown = await res.json();
				const parsed = directoryResponseSchema.safeParse(json);
				if (!parsed.success) {
					throw new Error("Malformed API response");
				}
				return parsed.data;
			})
			.then((response) => {
				if (page === 1) {
					setStartups(response.data);
				} else {
					setStartups((prev) => [...prev, ...response.data]);
				}
				setTotal(response.total);
				setLoading(false);
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === "AbortError") return;
				console.error("[directory] fetch failed:", err);
				setFetchError(
					locale === "es"
						? "No se pudo cargar el directorio. Intenta de nuevo."
						: "Failed to load the directory. Please try again.",
				);
				setLoading(false);
			});

		return () => controller.abort();
	}, [
		debouncedSearch,
		selectedVerticals,
		selectedCountry,
		selectedMaturity,
		sort,
		page,
		locale,
		hasFiltersActive,
		initialStartups,
		totalCount,
	]);

	// ---- CTA visibility via IntersectionObserver sentinel ----

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					setCtaVisible(!entry.isIntersecting);
				}
			},
			{ threshold: 0 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// ---- Derived data ----

	const countries = useMemo(() => {
		const set = new Set(mapPoints.map((s) => s.country));
		return Array.from(set).sort();
	}, [mapPoints]);

	const verticalKeys: readonly VerticalKey[] = VERTICAL_KEYS;
	const maturityKeys: readonly MaturityKey[] = MATURITY_KEYS;

	// ---- Tab filtering (client-side post-filter on fetched startups) ----
	const currentYear = new Date().getFullYear();

	const filtered = useMemo(() => {
		if (activeTab === "all") return startups;
		return startups.filter((s) => {
			if (activeTab === "pilot") return s.maturity_level === "pilot";
			if (activeTab === "raising") {
				return (
					!!s.funding_received &&
					(s.maturity_level === "prototype" ||
						s.maturity_level === "pilot" ||
						s.maturity_level === "revenue")
				);
			}
			if (activeTab === "new") {
				return s.founding_year !== null && s.founding_year >= currentYear - 2;
			}
			if (activeTab === "stealth") return !s.funding_received;
			return true;
		});
	}, [startups, activeTab, currentYear]);

	const filteredSlugs = useMemo(() => new Set(filtered.map((s) => s.slug)), [filtered]);

	const hasFilters = hasFiltersActive || activeTab !== "all";

	function clearAllFilters() {
		setSearch("");
		setDebouncedSearch("");
		setSelectedVerticals(new Set());
		setSelectedCountry("");
		setSelectedMaturity("");
		setActiveTab("all");
	}

	function toggleVertical(key: VerticalKey) {
		setSelectedVerticals((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
				track("directory_filter_vertical", { vertical: key });
			}
			return next;
		});
	}

	function applyTab(tab: TabKey) {
		setActiveTab(tab);
		track("directory_tab", { tab });
	}

	// ---- Map interaction ----

	function handleMapDotHover(slug: string, svgX: number, svgY: number) {
		setHoveredStartup(slug);
		if (mapSvgRef.current) {
			const rect = mapSvgRef.current.getBoundingClientRect();
			const scaleX = rect.width / MAP_W;
			const scaleY = rect.height / MAP_H;
			setTooltipPos({
				x: rect.left + svgX * scaleX,
				y: rect.top + svgY * scaleY,
			});
		}
	}

	function handleMapDotClick(slug: string) {
		const el = cardRefs.current.get(slug);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
			el.style.outline = `2px solid var(--primary)`;
			el.style.outlineOffset = "2px";
			setTimeout(() => {
				el.style.outline = "none";
			}, 2000);
		}
	}

	function handleCountryClick(country: string) {
		setSelectedCountry((prev) => (prev === country ? "" : country));
	}

	// ---- Map dots ----

	const americasDots = useMemo(
		() =>
			AMERICAS_POINTS.map(([lat, lng]) => {
				const pos = projectToSvg(lat, lng, MAP_W, MAP_H);
				return { ...pos, key: `a-${lat}-${lng}` };
			}),
		[],
	);

	const latamDots = useMemo(
		() =>
			LATAM_POINTS.map(([lat, lng]) => {
				const pos = projectToSvg(lat, lng, MAP_W, MAP_H);
				return { ...pos, key: `l-${lat}-${lng}` };
			}),
		[],
	);

	const startupMapDots = useMemo(
		() =>
			mapPoints.map((s) => {
				const pos = projectToSvg(s.lat, s.lng, MAP_W, MAP_H);
				const color = getVColor(s.verticals[0] ?? "other");
				const isFiltered = filteredSlugs.has(s.slug);
				return { ...pos, color, slug: s.slug, name: s.slug, isFiltered };
			}),
		[mapPoints, filteredSlugs],
	);

	const countryLabels = useMemo(
		() =>
			COUNTRY_LABELS.map(([lat, lng, name]) => {
				const pos = projectToSvg(lat, lng, MAP_W, MAP_H);
				return { ...pos, name };
			}),
		[],
	);

	// ---- Hovered startup data ----

	const hoveredData = hoveredStartup
		? (startups.find((s) => s.slug === hoveredStartup) ?? null)
		: null;

	// ---- Filter summary for result counter ----

	const filterSummary = useMemo(() => {
		const bits: string[] = [];
		if (activeTab !== "all") {
			const tabLabel =
				activeTab === "pilot"
					? labels.tabPilotReady
					: activeTab === "raising"
						? labels.tabRaising
						: activeTab === "new"
							? labels.tabNew
							: labels.tabStealth;
			bits.push(tabLabel);
		}
		for (const v of selectedVerticals) {
			bits.push(VERTICAL_CONFIG[v]?.label[locale] ?? v);
		}
		if (selectedCountry) bits.push(selectedCountry);
		if (selectedMaturity && isMaturityKey(selectedMaturity)) {
			bits.push(MATURITY_CONFIG[selectedMaturity].label[locale]);
		}
		if (debouncedSearch) bits.push(`"${debouncedSearch}"`);
		return bits;
	}, [
		activeTab,
		selectedVerticals,
		selectedCountry,
		selectedMaturity,
		debouncedSearch,
		locale,
		labels.tabPilotReady,
		labels.tabRaising,
		labels.tabNew,
		labels.tabStealth,
	]);

	// ---- Tabs config ----

	const tabs: { key: TabKey; label: string }[] = [
		{ key: "all", label: labels.tabAll },
		{ key: "pilot", label: labels.tabPilotReady },
		{ key: "raising", label: labels.tabRaising },
		{ key: "new", label: labels.tabNew },
		{ key: "stealth", label: labels.tabStealth },
	];

	// ---- Render ----

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{/* ─── Directory Hero Banner ─────────────────────────────── */}
			<header className="mb-8 pt-2">
				<p
					className="text-xs tracking-[0.18em]"
					style={{
						fontFamily: "var(--font-mono)",
						color: "var(--secondary)",
					}}
				>
					{labels.heroKickerPrefix} · {totalCount} {labels.heroKickerStartups} · {countriesCount}{" "}
					{labels.heroKickerCountries}
				</p>
				<h1
					className="mt-3 text-3xl leading-[1.05] sm:text-5xl lg:text-6xl"
					style={{
						fontFamily: "var(--font-display)",
						color: "var(--foreground)",
						fontWeight: 700,
						letterSpacing: "-0.01em",
					}}
				>
					{labels.heroHeadline}
				</h1>
				<p
					className="mt-4 max-w-[48ch] text-base leading-relaxed sm:text-lg"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--muted-foreground)",
					}}
				>
					{labels.heroDescriptor}
				</p>
				<div
					className="mt-8 w-full"
					style={{ borderTop: "2px solid var(--border-subtle)" }}
					aria-hidden="true"
				/>
			</header>

			{/* Map Panel */}
			<div className="mb-4 flex items-center justify-end md:hidden">
				<button
					type="button"
					onClick={() => setShowMap((p) => !p)}
					className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-150"
					style={{
						fontFamily: "var(--font-mono)",
						color: "var(--muted-foreground)",
						background: "var(--muted)",
					}}
				>
					{showMap ? labels.hideMap : labels.showMap}
				</button>
			</div>

			{showMap && (
				<div
					className="relative mb-6 overflow-hidden border"
					style={{
						background: "var(--card)",
						borderColor: "var(--border-subtle)",
						height: "clamp(240px, 40vh, 500px)",
					}}
				>
					<svg
						ref={mapSvgRef}
						viewBox={`0 0 ${MAP_W} ${MAP_H}`}
						className="h-full w-full"
						aria-label="Startup map"
						onMouseLeave={() => {
							setHoveredStartup(null);
							setTooltipPos(null);
						}}
					>
						<g opacity="0.06">
							{americasDots.map((d) => (
								<circle key={d.key} cx={d.x} cy={d.y} r="2" fill="white" />
							))}
						</g>
						<g opacity="0.12">
							{latamDots.map((d) => (
								<circle key={d.key} cx={d.x} cy={d.y} r="2" fill="white" />
							))}
						</g>

						<g>
							{countryLabels.map((cl) => (
								<a
									key={cl.name}
									href={`#filter-${cl.name.toLowerCase()}`}
									className="cursor-pointer"
									onClick={(e) => {
										e.preventDefault();
										handleCountryClick(cl.name);
									}}
									onMouseEnter={(e) => {
										const text = e.currentTarget.querySelector("text");
										if (text) text.style.fill = "rgba(255,255,255,0.5)";
									}}
									onMouseLeave={(e) => {
										const text = e.currentTarget.querySelector("text");
										if (text) text.style.fill = "rgba(255,255,255,0.25)";
									}}
								>
									<text
										x={cl.x}
										y={cl.y}
										fill="rgba(255,255,255,0.25)"
										fontSize="10"
										fontFamily="var(--font-mono)"
										textAnchor="middle"
										className="select-none"
										style={{ transition: "fill 0.15s" }}
									>
										{cl.name}
									</text>
								</a>
							))}
						</g>

						<g>
							{startupMapDots.map((d) => (
								<g
									key={d.slug}
									opacity={hasFilters && !d.isFiltered ? 0.15 : 1}
									style={{ transition: "opacity 0.3s" }}
								>
									<circle cx={d.x} cy={d.y} r="8" fill={d.color} opacity="0.2" />
									<a
										href={`#startup-${d.slug}`}
										aria-label={d.name}
										className="cursor-pointer"
										onClick={(e) => {
											e.preventDefault();
											handleMapDotClick(d.slug);
										}}
										onMouseEnter={() => handleMapDotHover(d.slug, d.x, d.y)}
									>
										<circle cx={d.x} cy={d.y} r="4" fill={d.color} />
									</a>
								</g>
							))}
						</g>
					</svg>

					{hoveredData && tooltipPos && (
						<div
							className="pointer-events-none fixed z-50 max-w-xs border px-3 py-2"
							style={{
								left: `${tooltipPos.x + 12}px`,
								top: `${tooltipPos.y - 8}px`,
								background: "var(--popover)",
								borderColor: "var(--border)",
								transform: "translateY(-100%)",
							}}
						>
							<p
								className="text-sm font-semibold"
								style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
							>
								{hoveredData.name}
							</p>
							<div className="mt-1 flex flex-wrap gap-1">
								{hoveredData.verticals.slice(0, 2).map((v) => (
									<span
										key={v}
										className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
										style={{
											background: getVMuted(v),
											color: getVColor(v),
											fontFamily: "var(--font-mono)",
										}}
									>
										<span
											className="inline-block h-1.5 w-1.5"
											style={{ background: getVColor(v) }}
										/>
										{VERTICAL_CONFIG[v]?.label[locale] ?? v}
									</span>
								))}
							</div>
							<p
								className="mt-1 text-xs line-clamp-2"
								style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
							>
								{locale === "en" ? hoveredData.one_liner_en : hoveredData.one_liner}
							</p>
						</div>
					)}
				</div>
			)}

			{/* ─── Filter tabs (primary) ─────────────────────────────── */}
			<div
				className="mb-4 flex gap-0 overflow-x-auto border-b"
				style={{ borderColor: "var(--border-subtle)" }}
				role="tablist"
			>
				{tabs.map((tab) => {
					const active = activeTab === tab.key;
					return (
						<button
							key={tab.key}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => applyTab(tab.key)}
							className="shrink-0 cursor-pointer px-4 py-3 text-xs uppercase tracking-wider transition-colors duration-150"
							style={{
								fontFamily: "var(--font-mono)",
								color: active ? "var(--foreground)" : "var(--muted-foreground)",
								background: "transparent",
								borderBottom: active ? "2px solid var(--secondary)" : "2px solid transparent",
								marginBottom: "-2px",
							}}
						>
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* ─── Filter Bar (secondary filters) ────────────────────── */}
			<div
				className="sticky top-14 z-10 mb-6 flex flex-col gap-3 border p-4"
				style={{
					background: "color-mix(in oklch, var(--background) 96%, transparent)",
					borderColor: "var(--border-subtle)",
				}}
			>
				<input
					type="text"
					value={search}
					onChange={(e) => handleSearchInput(e.target.value)}
					placeholder={labels.searchPlaceholder}
					className="h-10 w-full border bg-transparent px-3 text-sm outline-none transition-colors duration-150"
					style={{
						fontFamily: "var(--font-body)",
						borderColor: "var(--input)",
						color: "var(--foreground)",
					}}
				/>

				<div className="flex gap-2 overflow-x-auto pb-1">
					{verticalKeys.map((key) => {
						const active = selectedVerticals.has(key);
						const cfg = VERTICAL_CONFIG[key];
						return (
							<button
								key={key}
								type="button"
								onClick={() => toggleVertical(key)}
								className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3 py-1 text-xs font-medium transition-all duration-150"
								style={{
									fontFamily: "var(--font-mono)",
									background: active ? getVMuted(key) : "var(--muted)",
									color: active ? getVColor(key) : "var(--muted-foreground)",
									border: active ? `1px solid ${getVColor(key)}40` : "1px solid transparent",
								}}
							>
								<span className="inline-block h-2 w-2" style={{ background: cfg.color }} />
								{cfg.label[locale]}
							</button>
						);
					})}
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<select
						value={selectedCountry}
						onChange={(e) => setSelectedCountry(e.target.value)}
						className="h-8 cursor-pointer border bg-transparent px-2 text-xs outline-none"
						style={{
							fontFamily: "var(--font-mono)",
							borderColor: "var(--input)",
							color: "var(--foreground)",
							borderRadius: 0,
						}}
					>
						<option value="" style={{ background: "var(--popover)" }}>
							{labels.filterCountryAll}
						</option>
						{countries.map((c) => (
							<option key={c} value={c} style={{ background: "var(--popover)" }}>
								{COUNTRY_FLAGS[c] ?? ""}{" "}
								{locale === "es" ? (startups.find((s) => s.country === c)?.country_es ?? c) : c}
							</option>
						))}
					</select>

					<select
						value={selectedMaturity}
						onChange={(e) => setSelectedMaturity(e.target.value)}
						className="h-8 cursor-pointer border bg-transparent px-2 text-xs outline-none"
						style={{
							fontFamily: "var(--font-mono)",
							borderColor: "var(--input)",
							color: "var(--foreground)",
							borderRadius: 0,
						}}
					>
						<option value="" style={{ background: "var(--popover)" }}>
							{labels.filterMaturityAll}
						</option>
						{maturityKeys.map((k) => (
							<option key={k} value={k} style={{ background: "var(--popover)" }}>
								{MATURITY_CONFIG[k].label[locale]}
							</option>
						))}
					</select>

					<div className="ml-auto flex items-center gap-2">
						<span
							className="text-xs uppercase tracking-wider"
							style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
						>
							{labels.sortLabel}:
						</span>
						<select
							value={sort}
							onChange={(e) => {
								if (e.target.value === "az" || e.target.value === "newest") {
									setSort(e.target.value);
								}
							}}
							className="h-8 cursor-pointer border bg-transparent px-2 text-xs outline-none"
							style={{
								fontFamily: "var(--font-mono)",
								borderColor: "var(--input)",
								color: "var(--foreground)",
								borderRadius: 0,
							}}
						>
							<option value="az" style={{ background: "var(--popover)" }}>
								{labels.sortAZ}
							</option>
							<option value="newest" style={{ background: "var(--popover)" }}>
								{labels.sortNewest}
							</option>
						</select>
					</div>
				</div>

				{hasFilters && (
					<div className="flex flex-wrap items-center gap-2">
						{selectedVerticals.size > 0 &&
							Array.from(selectedVerticals).map((v) => (
								<button
									key={v}
									type="button"
									onClick={() => toggleVertical(v)}
									className="inline-flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs transition-colors duration-150"
									style={{
										background: getVMuted(v),
										color: getVColor(v),
										fontFamily: "var(--font-mono)",
									}}
								>
									{VERTICAL_CONFIG[v]?.label[locale] ?? v}
									<span aria-hidden="true">&times;</span>
								</button>
							))}

						{selectedCountry && (
							<button
								type="button"
								onClick={() => setSelectedCountry("")}
								className="inline-flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs transition-colors duration-150"
								style={{
									background: "var(--muted)",
									color: "var(--muted-foreground)",
									fontFamily: "var(--font-mono)",
								}}
							>
								{selectedCountry}
								<span aria-hidden="true">&times;</span>
							</button>
						)}

						{selectedMaturity && (
							<button
								type="button"
								onClick={() => setSelectedMaturity("")}
								className="inline-flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs transition-colors duration-150"
								style={{
									background: "var(--muted)",
									color: "var(--muted-foreground)",
									fontFamily: "var(--font-mono)",
								}}
							>
								{isMaturityKey(selectedMaturity)
									? MATURITY_CONFIG[selectedMaturity].label[locale]
									: selectedMaturity}
								<span aria-hidden="true">&times;</span>
							</button>
						)}

						<button
							type="button"
							onClick={clearAllFilters}
							className="cursor-pointer text-xs font-medium uppercase tracking-wider transition-colors duration-150"
							style={{
								fontFamily: "var(--font-mono)",
								color: "var(--primary)",
							}}
						>
							{labels.clearAll}
						</button>
					</div>
				)}
			</div>

			{/* ─── Result counter sentence ───────────────────────────── */}
			<div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
				<span
					className="text-sm"
					style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
				>
					<span
						className="text-base font-semibold"
						style={{ fontFamily: "var(--font-mono)", color: "var(--secondary)" }}
					>
						{filtered.length}
					</span>{" "}
					{locale === "es" ? "de" : "of"}{" "}
					<span
						className="text-base font-semibold"
						style={{ fontFamily: "var(--font-mono)", color: "var(--secondary)" }}
					>
						{total}
					</span>{" "}
					{locale === "es" ? "startups" : "startups"}
				</span>
				<span
					className="text-xs uppercase tracking-wider"
					style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
				>
					·{" "}
					{filterSummary.length > 0
						? `${labels.resultFilteredBy}: ${filterSummary.join(" · ")}`
						: labels.resultNone}
				</span>
			</div>

			{/* Fetch error banner */}
			{fetchError && (
				<div
					role="alert"
					className="mb-4 border px-4 py-3 text-sm"
					style={{
						background: "var(--card)",
						borderColor: "var(--destructive, #ef4444)",
						color: "var(--destructive, #ef4444)",
						fontFamily: "var(--font-body)",
					}}
				>
					{fetchError}
				</div>
			)}

			{/* ─── Card Grid ─────────────────────────────────────────── */}
			{filtered.length > 0 ? (
				<div className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((s) => {
						const oneLiner = locale === "en" ? s.one_liner_en : s.one_liner;
						const firstV = s.verticals[0];
						const accentColor = getVColor(firstV ?? "other");
						const initial = s.name.charAt(0).toUpperCase();
						const flag = COUNTRY_FLAGS[s.country] ?? "";
						const displayCountry = locale === "es" ? s.country_es : s.country;
						const href = `${startupBaseHref}${s.slug}`;
						const isSaved = savedSlugs.has(s.slug);
						const isShared = sharedSlug === s.slug;

						return (
							<div
								key={s.slug}
								ref={(el) => {
									if (el) {
										cardRefs.current.set(s.slug, el);
									}
								}}
								className="directory-card group relative border transition-all duration-200 hover:-translate-y-0.5"
								style={
									{
										background: "var(--card)",
										borderColor: "var(--border-subtle)",
										borderRadius: 0,
										"--card-accent": accentColor,
									} as React.CSSProperties
								}
							>
								<a href={href} className="block p-6">
									<div className="flex items-start gap-4">
										<div
											className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold text-white"
											style={{ background: accentColor, fontFamily: "var(--font-display)" }}
										>
											{initial}
										</div>

										<div className="min-w-0 flex-1">
											<h3
												className="text-base font-semibold leading-tight"
												style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
											>
												{s.name}
											</h3>
											<p
												className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
												style={{
													fontFamily: "var(--font-body)",
													color: "var(--muted-foreground)",
												}}
											>
												{oneLiner}
											</p>

											<div className="mt-3 flex flex-wrap items-center gap-2">
												<span
													className="inline-flex items-center gap-1 text-xs"
													style={{
														fontFamily: "var(--font-body)",
														color: "var(--text-tertiary)",
													}}
												>
													{flag && <span aria-hidden="true">{flag}</span>}
													{s.city}, {displayCountry}
												</span>

												<span style={{ color: "var(--border-strong)" }} aria-hidden="true">
													&middot;
												</span>

												{s.verticals.slice(0, 2).map((v) => (
													<span
														key={v}
														className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
														style={{
															fontFamily: "var(--font-mono)",
															background: getVMuted(v),
															color: getVColor(v),
														}}
													>
														<span
															className="inline-block h-1.5 w-1.5"
															style={{ background: getVColor(v) }}
														/>
														{VERTICAL_CONFIG[v]?.label[locale] ?? v}
													</span>
												))}

												<span style={{ color: "var(--border-strong)" }} aria-hidden="true">
													&middot;
												</span>

												<span
													className="inline-flex items-center px-2 py-0.5 text-xs font-medium"
													style={{
														fontFamily: "var(--font-mono)",
														background: "var(--muted)",
														color: "var(--muted-foreground)",
													}}
												>
													{MATURITY_CONFIG[s.maturity_level]?.label[locale] ?? s.maturity_level}
												</span>

												{s.funding_received && (
													<>
														<span style={{ color: "var(--border-strong)" }} aria-hidden="true">
															&middot;
														</span>
														<span
															className="text-xs"
															style={{
																fontFamily: "var(--font-mono)",
																color: "var(--text-tertiary)",
															}}
														>
															{s.funding_received}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								</a>

								{/* Quick actions overlay — desktop hover only */}
								<div
									className="directory-card__actions pointer-events-none absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-150"
									aria-hidden="true"
								>
									<a
										href={`${contactHref}?startup=${s.slug}`}
										title={labels.quickBookIntro}
										aria-label={labels.quickBookIntro}
										className="pointer-events-auto flex h-7 w-7 items-center justify-center transition-colors duration-150"
										style={{
											background: "var(--primary)",
											color: "var(--primary-foreground)",
											fontFamily: "var(--font-mono)",
										}}
										onClick={(e) => {
											e.stopPropagation();
											track("directory_book_intro", { slug: s.slug });
										}}
									>
										<span className="sr-only">{labels.quickBookIntro}</span>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M9 5l6 7-6 7" />
										</svg>
									</a>
									<button
										type="button"
										title={isSaved ? labels.quickSaved : labels.quickSave}
										aria-pressed={isSaved}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											toggleSaved(s.slug);
										}}
										className="pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center border transition-colors duration-150"
										style={{
											background: isSaved ? "var(--secondary)" : "transparent",
											borderColor: isSaved ? "var(--secondary)" : "var(--border)",
											color: isSaved ? "var(--secondary-foreground)" : "var(--foreground)",
										}}
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill={isSaved ? "currentColor" : "none"}
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M6 4h12v16l-6-4-6 4z" />
										</svg>
									</button>
									<button
										type="button"
										title={isShared ? labels.quickShared : labels.quickShare}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											void handleShare(s.slug);
										}}
										className="pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center border transition-colors duration-150"
										style={{
											background: isShared ? "var(--secondary)" : "transparent",
											borderColor: isShared ? "var(--secondary)" : "var(--border)",
											color: isShared ? "var(--secondary-foreground)" : "var(--foreground)",
										}}
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M10 13a3 3 0 0 0 4.24 0l4-4a3 3 0 0 0-4.24-4.24l-1.4 1.4" />
											<path d="M14 11a3 3 0 0 0-4.24 0l-4 4a3 3 0 0 0 4.24 4.24l1.4-1.4" />
										</svg>
									</button>
								</div>
							</div>
						);
					})}
					{filtered.length < total && (
						<div className="col-span-full flex justify-center pt-6">
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={loading}
								className="cursor-pointer border px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-150 disabled:opacity-50"
								style={{
									fontFamily: "var(--font-mono)",
									color: "var(--foreground)",
									borderColor: "var(--border-subtle)",
									background: "var(--card)",
								}}
							>
								{loading ? "..." : `${labels.loadMore} (${filtered.length}/${total})`}
							</button>
						</div>
					)}
				</div>
			) : (
				/* ─── Empty state (editorial) ────────────────────── */
				<div className="flex flex-col items-center justify-center py-24 text-center">
					<p
						className="text-xs tracking-[0.18em]"
						style={{
							fontFamily: "var(--font-mono)",
							color: "var(--secondary)",
						}}
					>
						{labels.emptyKicker}
					</p>
					<h3
						className="mt-4 max-w-xl text-2xl leading-tight sm:text-3xl"
						style={{
							fontFamily: "var(--font-display)",
							color: "var(--foreground)",
							fontWeight: 700,
						}}
					>
						{labels.emptyHeadline}
					</h3>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<a
							href={contactHref}
							className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-150"
							style={{
								fontFamily: "var(--font-mono)",
								background: "var(--primary)",
								color: "var(--primary-foreground)",
							}}
						>
							{labels.emptyContactCta}
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M9 5l6 7-6 7" />
							</svg>
						</a>
						<button
							type="button"
							onClick={clearAllFilters}
							className="cursor-pointer border px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-150"
							style={{
								fontFamily: "var(--font-mono)",
								borderColor: "var(--border)",
								color: "var(--foreground)",
								background: "transparent",
							}}
						>
							{labels.clearAll}
						</button>
					</div>
				</div>
			)}

			{/* Sentinel for auto-hiding floating CTA (placed after the grid) */}
			<div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

			{/* ─── Floating corporate CTA — desktop ───────────────────── */}
			<div
				className="fixed bottom-6 right-6 z-30 hidden transition-opacity duration-200 md:block"
				style={{
					opacity: ctaVisible ? 1 : 0,
					pointerEvents: ctaVisible ? "auto" : "none",
				}}
			>
				<button
					type="button"
					onClick={() => setCorporateOpen(true)}
					className="group inline-flex cursor-pointer flex-col items-stretch border px-6 py-4 text-left transition-colors duration-150"
					style={{
						background: "var(--primary)",
						color: "var(--primary-foreground)",
						borderColor: "var(--primary)",
						borderRadius: 0,
					}}
				>
					<span
						className="text-[10px] uppercase tracking-[0.18em]"
						style={{
							fontFamily: "var(--font-mono)",
							color: "var(--secondary)",
						}}
					>
						{labels.floatingKicker}
					</span>
					<span
						className="mt-1 inline-flex items-center gap-2 text-base font-semibold"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{labels.floatingLabel}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M9 5l6 7-6 7" />
						</svg>
					</span>
				</button>
			</div>

			{/* ─── Mobile: bottom bar ──────────────────────────────────── */}
			<div
				className="fixed bottom-0 left-0 right-0 z-30 border-t p-3 transition-opacity duration-200 md:hidden"
				style={{
					background: "color-mix(in oklch, var(--background) 96%, transparent)",
					borderColor: "var(--border-subtle)",
					opacity: ctaVisible ? 1 : 0,
					pointerEvents: ctaVisible ? "auto" : "none",
				}}
			>
				<button
					type="button"
					onClick={() => setCorporateOpen(true)}
					className="flex w-full cursor-pointer flex-col items-center justify-center px-4 py-3"
					style={{
						background: "var(--primary)",
						color: "var(--primary-foreground)",
						borderRadius: 0,
					}}
				>
					<span
						className="text-[10px] uppercase tracking-[0.18em]"
						style={{ fontFamily: "var(--font-mono)", color: "var(--secondary)" }}
					>
						{labels.mobileCtaKicker}
					</span>
					<span
						className="mt-0.5 text-sm font-semibold"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{labels.floatingLabel}
					</span>
				</button>
			</div>

			{/* Corporate Modal */}
			<CorporateModal
				isOpen={corporateOpen}
				onClose={() => setCorporateOpen(false)}
				locale={locale}
			/>

			{/* Scoped styles: show quick-actions on hover for hover-capable pointers only */}
			<style>{`
				@media (hover: hover) {
					.directory-card:hover .directory-card__actions {
						opacity: 1;
					}
				}
			`}</style>
		</div>
	);
}
