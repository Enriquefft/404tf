import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

	const chartData = data.map((d) => ({
		...d,
		name: d.label[locale],
	}));

	return (
		<div ref={ref} style={{ width: "100%", height: data.length * 48 + 24 }}>
			{visible && (
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
							onClick={(entry) => {
								const vertical = (entry as unknown as { vertical: string }).vertical;
								window.location.href = `${directoryPath}?vertical=${encodeURIComponent(vertical)}`;
							}}
						>
							{chartData.map((entry) => (
								<Cell key={entry.vertical} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
