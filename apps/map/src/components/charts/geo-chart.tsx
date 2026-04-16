import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { z } from "zod";

const countryEntrySchema = z.object({ country: z.string() });

// LabelList content render prop. Recharts passes the bar's geometry as
// `viewBox` plus the data point's `value` and zero-based `index`. We read
// those three and render an amber-highlighted variant when the row matches
// the configured leader index — giving the top country a 2px right tick
// and amber numeral without affecting the rest of the chart.
// Extract numeric geometry from the wide recharts label-content props.
// recharts passes `viewBox` as a union (cartesian/polar); for bar labels the
// cartesian variant has x/y/width/height. We parse defensively via zod to
// avoid `as` casts while still reading from the wide incoming shape.
const labelRenderSchema = z.object({
	viewBox: z
		.object({
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number().optional(),
			height: z.number().optional(),
		})
		.optional(),
	value: z.union([z.string(), z.number()]).optional(),
	index: z.number().optional(),
});

function readLabel(raw: unknown) {
	const parsed = labelRenderSchema.safeParse(raw);
	const data = parsed.success ? parsed.data : {};
	const vb = data.viewBox ?? {};
	return {
		x: vb.x ?? 0,
		y: vb.y ?? 0,
		width: vb.width ?? 0,
		height: vb.height ?? 0,
		value: data.value ?? "",
		index: data.index ?? 0,
	};
}

function LeaderLabel(props: { raw: unknown; leaderIndex: number }) {
	const { raw, leaderIndex } = props;
	const { x, y, width, height, value, index } = readLabel(raw);
	const isLeader = index === leaderIndex;
	return (
		<g>
			{isLeader ? (
				<rect x={x + width} y={y} width={2} height={height} fill="var(--secondary)" />
			) : null}
			<text
				x={x + width + 10}
				y={y + height / 2}
				dy={4}
				fill={isLeader ? "var(--secondary)" : "var(--muted-foreground)"}
				fontFamily="var(--font-mono)"
				fontSize={13}
				fontWeight={isLeader ? 600 : 400}
			>
				{value}
			</text>
		</g>
	);
}

type GeoChartProps = {
	data: Array<{ country: string; count: number; flag: string }>;
	directoryPath: string;
};

export function GeoChart({ data, directoryPath }: GeoChartProps) {
	return (
		<div style={{ width: "100%", height: data.length * 48 + 24 }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
					<XAxis type="number" hide />
					<YAxis
						type="category"
						dataKey="country"
						width={120}
						axisLine={false}
						tickLine={false}
						tick={(props) => {
							const { x, y, payload } = props;
							const item = data.find((d) => d.country === payload.value);
							return (
								<text
									x={x}
									y={y}
									dy={5}
									textAnchor="end"
									fill="var(--muted-foreground)"
									style={{
										fontFamily: "var(--font-body)",
										fontSize: 13,
									}}
								>
									{item?.flag} {payload.value}
								</text>
							);
						}}
					/>
					<Tooltip
						cursor={{ fill: "var(--primary-8)" }}
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;
							const item = payload[0].payload as (typeof data)[number];
							return (
								<div
									style={{
										background: "var(--popover)",
										border: "1px solid var(--border)",
										borderRadius: "var(--radius-md)",
										padding: "8px 12px",
										fontFamily: "var(--font-body)",
										fontSize: 13,
									}}
								>
									<span style={{ color: "var(--foreground)" }}>
										{item.flag} {item.country}:{" "}
									</span>
									<strong
										style={{
											fontFamily: "var(--font-mono)",
											color: "var(--primary-light)",
										}}
									>
										{item.count}
									</strong>
								</div>
							);
						}}
					/>
					<Bar
						dataKey="count"
						radius={[0, 0, 0, 0]}
						animationBegin={0}
						animationDuration={800}
						animationEasing="ease-out"
						style={{ cursor: "pointer" }}
						onClick={(entry: unknown) => {
							const parsed = countryEntrySchema.safeParse(entry);
							if (!parsed.success) return;
							window.location.href = `${directoryPath}?country=${encodeURIComponent(parsed.data.country)}`;
						}}
					>
						{data.map((entry, index) => (
							<Cell key={entry.country} fill="var(--primary)" fillOpacity={1 - index * 0.08} />
						))}
						<LabelList
							dataKey="count"
							content={(props) => <LeaderLabel raw={props} leaderIndex={0} />}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
