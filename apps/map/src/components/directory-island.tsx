import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CorporateModal } from "@/components/corporate-modal";
import type { Locale } from "@/i18n/translations";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { AMERICAS_POINTS, COUNTRY_LABELS, LATAM_POINTS, projectToSvg } from "@/lib/map-points";
import { track } from "@/lib/track";
import {
	MATURITY_CONFIG,
	type MaturityKey,
	VERTICAL_CONFIG,
	type VerticalKey,
} from "@/lib/verticals";

// ---- Types ----

type StartupData = {
	slug: string;
	name: string;
	one_liner: string;
	one_liner_en: string;
	country: string;
	country_es: string;
	city: string;
	lat: number;
	lng: number;
	verticals: VerticalKey[];
	maturity_level: MaturityKey;
	founding_year: number;
	funding_received: string | null;
};

type MapPoint = {
	slug: string;
	lat: number;
	lng: number;
	verticals: VerticalKey[];
	country: string;
};

type DirectoryIslandProps = {
	initialStartups: StartupData[];
	totalCount: number;
	mapPoints: MapPoint[];
	locale: Locale;
	labels: {
		searchPlaceholder: string;
		filterCountry: string;
		filterCountryAll: string;
		filterMaturity: string;
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
		mapTooltipIn: string;
		ctaFindSolution: string;
	};
	startupBaseHref: string;
};

type SortKey = "az" | "newest";

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

// ---- Component ----

export function DirectoryIsland({
	initialStartups,
	totalCount,
	mapPoints,
	locale,
	labels,
	startupBaseHref,
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

	// API-driven state
	const [startups, setStartups] = useState<StartupData[]>(initialStartups);
	const [total, setTotal] = useState(totalCount);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
	const mapSvgRef = useRef<SVGSVGElement>(null);

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

	// ---- Fetch from API when filters change ----

	const hasFiltersActive =
		debouncedSearch !== "" ||
		selectedVerticals.size > 0 ||
		selectedCountry !== "" ||
		selectedMaturity !== "";

	useEffect(() => {
		// On initial load with no filters, use the embedded data
		if (!hasFiltersActive && sort === "az" && page === 1) {
			setStartups(initialStartups);
			setTotal(totalCount);
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);

		const params = new URLSearchParams();
		if (debouncedSearch) params.set("q", debouncedSearch);
		if (selectedVerticals.size > 0) params.set("vertical", [...selectedVerticals][0]);
		if (selectedCountry) params.set("country", selectedCountry);
		if (selectedMaturity) params.set("maturity", selectedMaturity);
		params.set("sort", sort);
		params.set("page", String(page));
		params.set("limit", "20");
		params.set("locale", locale);

		fetch(`/api/directory?${params}`, { signal: controller.signal })
			.then((res) => res.json())
			.then((json: { data: StartupData[]; total: number }) => {
				if (page === 1) {
					setStartups(json.data);
				} else {
					setStartups((prev) => [...prev, ...json.data]);
				}
				setTotal(json.total);
				setLoading(false);
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === "AbortError") return;
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

	// Reset to page 1 when filters change — deps are intentional trigger conditions
	// biome-ignore lint/correctness/useExhaustiveDependencies: filter values are triggers, not consumed
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, selectedVerticals, selectedCountry, selectedMaturity, sort]);

	// ---- Derived data ----

	const countries = useMemo(() => {
		const set = new Set(mapPoints.map((s) => s.country));
		return Array.from(set).sort();
	}, [mapPoints]);

	const verticalKeys = useMemo(() => Object.keys(VERTICAL_CONFIG) as VerticalKey[], []);

	const maturityKeys = useMemo(() => Object.keys(MATURITY_CONFIG) as MaturityKey[], []);

	// ---- Filtered results (now comes from API) ----

	const filtered = startups;

	const filteredSlugs = useMemo(() => new Set(filtered.map((s) => s.slug)), [filtered]);

	const hasFilters = hasFiltersActive;

	function clearAllFilters() {
		setSearch("");
		setDebouncedSearch("");
		setSelectedVerticals(new Set());
		setSelectedCountry("");
		setSelectedMaturity("");
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

	// ---- Render ----

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{/* Map Panel */}
			<div className="mb-4 flex items-center justify-end md:hidden">
				<button
					type="button"
					onClick={() => setShowMap((p) => !p)}
					className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150"
					style={{
						fontFamily: "var(--font-heading)",
						color: "var(--muted-foreground)",
						background: "var(--muted)",
						borderRadius: "var(--radius-md)",
					}}
				>
					{showMap ? labels.hideMap : labels.showMap}
				</button>
			</div>

			{showMap && (
				<div
					className="relative mb-6 overflow-hidden rounded-lg border"
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
						{/* Background continent */}
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

						{/* Country labels */}
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
										fontFamily="var(--font-heading)"
										textAnchor="middle"
										className="select-none"
										style={{ transition: "fill 0.15s" }}
									>
										{cl.name}
									</text>
								</a>
							))}
						</g>

						{/* Startup dots */}
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

					{/* Tooltip */}
					{hoveredData && tooltipPos && (
						<div
							className="pointer-events-none fixed z-50 max-w-xs rounded-md border px-3 py-2"
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
								style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
							>
								{hoveredData.name}
							</p>
							<div className="mt-1 flex flex-wrap gap-1">
								{hoveredData.verticals.slice(0, 2).map((v) => (
									<span
										key={v}
										className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
										style={{
											background: getVMuted(v),
											color: getVColor(v),
											fontFamily: "var(--font-heading)",
										}}
									>
										<span
											className="inline-block h-1.5 w-1.5 rounded-full"
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

			{/* Filter Bar */}
			<div
				className="sticky top-14 z-10 mb-6 flex flex-col gap-3 rounded-lg border p-4"
				style={{
					background: "rgba(10, 7, 16, 0.85)",
					backdropFilter: "blur(12px)",
					borderColor: "var(--border-subtle)",
				}}
			>
				{/* Search */}
				<input
					type="text"
					value={search}
					onChange={(e) => handleSearchInput(e.target.value)}
					placeholder={labels.searchPlaceholder}
					className="h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors duration-150"
					style={{
						fontFamily: "var(--font-body)",
						borderColor: "var(--input)",
						color: "var(--foreground)",
					}}
				/>

				{/* Vertical chips */}
				<div className="flex gap-2 overflow-x-auto pb-1">
					{verticalKeys.map((key) => {
						const active = selectedVerticals.has(key);
						const cfg = VERTICAL_CONFIG[key];
						return (
							<button
								key={key}
								type="button"
								onClick={() => toggleVertical(key)}
								className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150"
								style={{
									fontFamily: "var(--font-heading)",
									background: active ? getVMuted(key) : "var(--muted)",
									color: active ? getVColor(key) : "var(--muted-foreground)",
									border: active ? `1px solid ${getVColor(key)}40` : "1px solid transparent",
								}}
							>
								<span
									className="inline-block h-2 w-2 rounded-full"
									style={{ background: cfg.color }}
								/>
								{cfg.label[locale]}
							</button>
						);
					})}
				</div>

				{/* Dropdowns + sort + counter */}
				<div className="flex flex-wrap items-center gap-3">
					{/* Country dropdown */}
					<select
						value={selectedCountry}
						onChange={(e) => setSelectedCountry(e.target.value)}
						className="h-8 cursor-pointer rounded-md border bg-transparent px-2 text-xs outline-none"
						style={{
							fontFamily: "var(--font-heading)",
							borderColor: "var(--input)",
							color: "var(--foreground)",
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

					{/* Maturity dropdown */}
					<select
						value={selectedMaturity}
						onChange={(e) => setSelectedMaturity(e.target.value)}
						className="h-8 cursor-pointer rounded-md border bg-transparent px-2 text-xs outline-none"
						style={{
							fontFamily: "var(--font-heading)",
							borderColor: "var(--input)",
							color: "var(--foreground)",
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

					{/* Sort */}
					<div className="ml-auto flex items-center gap-2">
						<span
							className="text-xs"
							style={{ fontFamily: "var(--font-heading)", color: "var(--muted-foreground)" }}
						>
							{labels.sortLabel}:
						</span>
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortKey)}
							className="h-8 cursor-pointer rounded-md border bg-transparent px-2 text-xs outline-none"
							style={{
								fontFamily: "var(--font-heading)",
								borderColor: "var(--input)",
								color: "var(--foreground)",
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

				{/* Active filters row */}
				{hasFilters && (
					<div className="flex flex-wrap items-center gap-2">
						<span
							className="text-xs"
							style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
						>
							{labels.showingOf
								.replace("{count}", String(filtered.length))
								.replace("{total}", String(total))}
						</span>

						{/* Active filter pills */}
						{selectedVerticals.size > 0 &&
							Array.from(selectedVerticals).map((v) => (
								<button
									key={v}
									type="button"
									onClick={() => toggleVertical(v)}
									className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors duration-150"
									style={{
										background: getVMuted(v),
										color: getVColor(v),
										fontFamily: "var(--font-heading)",
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
								className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors duration-150"
								style={{
									background: "var(--muted)",
									color: "var(--muted-foreground)",
									fontFamily: "var(--font-heading)",
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
								className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors duration-150"
								style={{
									background: "var(--muted)",
									color: "var(--muted-foreground)",
									fontFamily: "var(--font-heading)",
								}}
							>
								{MATURITY_CONFIG[selectedMaturity as MaturityKey]?.label[locale] ??
									selectedMaturity}
								<span aria-hidden="true">&times;</span>
							</button>
						)}

						<button
							type="button"
							onClick={clearAllFilters}
							className="cursor-pointer text-xs font-medium transition-colors duration-150"
							style={{
								fontFamily: "var(--font-heading)",
								color: "var(--primary)",
							}}
						>
							{labels.clearAll}
						</button>
					</div>
				)}
			</div>

			{/* Card Grid */}
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

						return (
							<a
								key={s.slug}
								ref={(el) => {
									if (el) {
										cardRefs.current.set(s.slug, el);
									}
								}}
								href={href}
								className="group relative block rounded-lg border p-6 transition-all duration-200"
								style={{
									background: "var(--card)",
									borderColor: "var(--border-subtle)",
								}}
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLElement).style.borderColor = accentColor;
									(e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
									(e.currentTarget as HTMLElement).style.transform = "translateY(0)";
								}}
							>
								<div className="flex items-start gap-4">
									{/* Initials circle */}
									<div
										className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
										style={{ background: accentColor, fontFamily: "var(--font-heading)" }}
									>
										{initial}
									</div>

									{/* Content */}
									<div className="min-w-0 flex-1">
										<h3
											className="text-base font-semibold leading-tight"
											style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
										>
											{s.name}
										</h3>
										<p
											className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
											style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
										>
											{oneLiner}
										</p>

										{/* Metadata */}
										<div className="mt-3 flex flex-wrap items-center gap-2">
											<span
												className="inline-flex items-center gap-1 text-xs"
												style={{ fontFamily: "var(--font-body)", color: "var(--text-tertiary)" }}
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
													className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
													style={{
														fontFamily: "var(--font-heading)",
														background: getVMuted(v),
														color: getVColor(v),
													}}
												>
													<span
														className="inline-block h-1.5 w-1.5 rounded-full"
														style={{ background: getVColor(v) }}
													/>
													{VERTICAL_CONFIG[v]?.label[locale] ?? v}
												</span>
											))}

											<span style={{ color: "var(--border-strong)" }} aria-hidden="true">
												&middot;
											</span>

											<span
												className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
												style={{
													fontFamily: "var(--font-heading)",
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

									{/* Arrow */}
									<div
										className="flex shrink-0 items-center self-center transition-colors duration-150"
										style={{ color: "var(--text-tertiary)" }}
									>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M9 5l6 7-6 7" />
										</svg>
									</div>
								</div>
							</a>
						);
					})}
					{filtered.length < total && (
						<div className="col-span-full flex justify-center pt-6">
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={loading}
								className="cursor-pointer rounded-lg border px-6 py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50"
								style={{
									fontFamily: "var(--font-heading)",
									color: "var(--foreground)",
									borderColor: "var(--border-subtle)",
									background: "var(--card)",
								}}
							>
								{loading ? "..." : `Load more (${filtered.length}/${total})`}
							</button>
						</div>
					)}
				</div>
			) : (
				/* Empty state */
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ color: "var(--text-tertiary)" }}
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="M21 21l-4.35-4.35" />
					</svg>
					<h3
						className="mt-4 text-lg font-semibold"
						style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
					>
						{labels.emptyTitle}
					</h3>
					<p
						className="mt-2 max-w-sm text-sm"
						style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}
					>
						{labels.emptyMessage}
					</p>
					<button
						type="button"
						onClick={clearAllFilters}
						className="mt-4 cursor-pointer text-sm font-medium transition-colors duration-150"
						style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}
					>
						{labels.clearAll}
					</button>
				</div>
			)}

			{/* Floating corporate CTA */}
			{/* Desktop: bottom-right button */}
			<div className="fixed bottom-6 right-6 z-30 hidden md:block">
				<button
					type="button"
					onClick={() => setCorporateOpen(true)}
					className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-lg transition-all duration-150"
					style={{
						fontFamily: "var(--font-heading)",
						background: "var(--primary)",
						color: "var(--primary-foreground)",
						borderColor: "var(--primary)",
						borderRadius: "var(--radius-md)",
					}}
				>
					{labels.ctaFindSolution}
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
				</button>
			</div>

			{/* Mobile: bottom bar */}
			<div
				className="fixed bottom-0 left-0 right-0 z-30 border-t p-3 md:hidden"
				style={{
					background: "rgba(10, 7, 16, 0.9)",
					backdropFilter: "blur(12px)",
					borderColor: "var(--border-subtle)",
				}}
			>
				<button
					type="button"
					onClick={() => setCorporateOpen(true)}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold"
					style={{
						fontFamily: "var(--font-heading)",
						background: "var(--primary)",
						color: "var(--primary-foreground)",
						borderRadius: "var(--radius-md)",
					}}
				>
					{labels.ctaFindSolution}
				</button>
			</div>

			{/* Corporate Modal */}
			<CorporateModal
				isOpen={corporateOpen}
				onClose={() => setCorporateOpen(false)}
				locale={locale}
			/>
		</div>
	);
}
