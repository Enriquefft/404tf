import { COUNTRY_FLAGS } from "@/lib/countries";

type CountryBar = {
	country: string;
	count: number;
};

type CountryBarChartProps = {
	data: CountryBar[];
	title: string;
};

export function CountryBarChart({ data, title }: CountryBarChartProps) {
	const maxCount = Math.max(...data.map((d) => d.count));

	return (
		<div className="flex flex-col gap-4">
			<h3
				className="text-sm font-semibold uppercase tracking-wider"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--muted-foreground)",
					letterSpacing: "0.08em",
				}}
			>
				{title}
			</h3>
			<div className="flex flex-col gap-3">
				{data.map((item) => {
					const pct = (item.count / maxCount) * 100;
					const flag = COUNTRY_FLAGS[item.country] ?? "";
					return (
						<div key={item.country} className="flex items-center gap-3">
							<span
								className="w-28 shrink-0 text-sm"
								style={{
									fontFamily: "var(--font-body)",
									color: "var(--foreground)",
								}}
							>
								{flag && (
									<span className="mr-1.5" aria-hidden="true">
										{flag}
									</span>
								)}
								{item.country}
							</span>
							<div
								className="relative h-7 flex-1 overflow-hidden rounded-sm"
								style={{ background: "var(--primary-8)" }}
							>
								<div
									className="absolute inset-y-0 left-0 rounded-sm"
									style={{
										width: `${pct}%`,
										background: "var(--primary)",
										opacity: 0.7,
										transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
									}}
								/>
							</div>
							<span
								className="w-8 shrink-0 text-right text-sm tabular-nums"
								style={{
									fontFamily: "var(--font-mono)",
									color: "var(--foreground)",
								}}
							>
								{item.count}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
