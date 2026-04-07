import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";

const countryEntrySchema = z.object({ country: z.string() });

type GeoChartProps = {
	data: Array<{ country: string; count: number; flag: string }>;
	directoryPath: string;
};

export function GeoChart({ data, directoryPath }: GeoChartProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} style={{ width: "100%", height: data.length * 48 + 24 }}>
			{visible && (
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
					>
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
							radius={[0, 4, 4, 0]}
							animationBegin={0}
							animationDuration={800}
							animationEasing="ease-out"
							label={{
								position: "right",
								fill: "var(--muted-foreground)",
								fontFamily: "var(--font-mono)",
								fontSize: 13,
							}}
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
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
