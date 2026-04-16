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

const verticalEntrySchema = z.object({ vertical: z.string() });

// LabelList content render prop. Highlights the first three rows in amber
// with a 2px right-edge tick + heavier numeral so the "TOP 3" framing
// carries visually into the chart itself, not just the kicker above it.
// Parses the wide recharts props via zod so we don't need `as` casts.
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

function TopRankLabel(props: { raw: unknown; topCount: number }) {
	const { raw, topCount } = props;
	const { x, y, width, height, value, index } = readLabel(raw);
	const isTop = index < topCount;
	return (
		<g>
			{isTop ? <rect x={x + width} y={y} width={2} height={height} fill="var(--primary)" /> : null}
			<text
				x={x + width + 10}
				y={y + height / 2}
				dy={4}
				fill={isTop ? "var(--foreground)" : "var(--muted-foreground)"}
				fontFamily="var(--font-mono)"
				fontSize={13}
				fontWeight={isTop ? 600 : 400}
			>
				{value}
			</text>
		</g>
	);
}

type VerticalChartProps = {
	data: Array<{
		vertical: string;
		count: number;
		label: { en: string; es: string };
		color: string;
	}>;
	locale: "en" | "es";
	directoryPath: string;
};

export function VerticalChart({ data, locale, directoryPath }: VerticalChartProps) {
	const chartData = data.map((d) => ({
		...d,
		name: d.label[locale],
	}));

	return (
		<div style={{ width: "100%", height: data.length * 48 + 24 }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={chartData}
					layout="vertical"
					margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
				>
					<XAxis type="number" hide />
					<YAxis
						type="category"
						dataKey="name"
						width={160}
						axisLine={false}
						tickLine={false}
						tick={{
							fill: "var(--muted-foreground)",
							fontFamily: "var(--font-body)",
							fontSize: 13,
						}}
					/>
					<Tooltip
						cursor={{ fill: "var(--primary-8)" }}
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;
							const item = payload[0].payload as (typeof chartData)[number];
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
									<span
										style={{
											display: "inline-block",
											width: 8,
											height: 8,
											borderRadius: "50%",
											background: item.color,
											marginRight: 6,
										}}
									/>
									<span style={{ color: "var(--foreground)" }}>{item.name}: </span>
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
							const parsed = verticalEntrySchema.safeParse(entry);
							if (!parsed.success) return;
							window.location.href = `${directoryPath}?verticals=${encodeURIComponent(parsed.data.vertical)}`;
						}}
					>
						{chartData.map((entry) => (
							<Cell key={entry.vertical} fill={entry.color} />
						))}
						<LabelList
							dataKey="count"
							content={(props) => <TopRankLabel raw={props} topCount={3} />}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
