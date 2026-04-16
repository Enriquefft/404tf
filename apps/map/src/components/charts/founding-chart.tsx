import {
	Area,
	AreaChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type FoundingChartProps = {
	data: Array<{ year: number; count: number }>;
	label: string;
	peakYear: number;
	peakLabel: string;
};

export function FoundingChart({ data, label, peakYear, peakLabel }: FoundingChartProps) {
	return (
		<div style={{ width: "100%", height: 280 }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="foundingGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
							<stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis
						dataKey="year"
						axisLine={false}
						tickLine={false}
						tick={{
							fill: "var(--muted-foreground)",
							fontFamily: "var(--font-mono)",
							fontSize: 12,
						}}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						width={32}
						tick={{
							fill: "var(--muted-foreground)",
							fontFamily: "var(--font-mono)",
							fontSize: 12,
						}}
					/>
					<Tooltip
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;
							const item = payload[0].payload as {
								year: number;
								count: number;
							};
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
									<strong
										style={{
											fontFamily: "var(--font-mono)",
											color: "var(--foreground)",
										}}
									>
										{item.year}
									</strong>
									<span style={{ color: "var(--muted-foreground)" }}> &mdash; </span>
									<span
										style={{
											fontFamily: "var(--font-mono)",
											color: "var(--primary-light)",
										}}
									>
										{item.count} {label}
									</span>
								</div>
							);
						}}
					/>
					<Area
						type="monotone"
						dataKey="count"
						stroke="var(--primary)"
						strokeWidth={2}
						fill="url(#foundingGradient)"
						animationBegin={0}
						animationDuration={1000}
						animationEasing="ease-out"
					/>
					<ReferenceLine
						x={peakYear}
						stroke="var(--map-secondary)"
						strokeWidth={1}
						strokeDasharray="4 4"
						label={{
							value: peakLabel,
							position: "top",
							fill: "var(--map-secondary)",
							fontFamily: "var(--font-mono)",
							fontSize: 11,
							fontWeight: 600,
						}}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
