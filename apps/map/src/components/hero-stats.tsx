import { useEffect, useRef, useState } from "react";

type StatItem = {
	value: number;
	suffix: string;
	label: string;
};

type HeroStatsProps = {
	stats: StatItem[];
};

function useCountUp(target: number, duration: number): number {
	const [current, setCurrent] = useState(0);
	const startRef = useRef<number | null>(null);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		startRef.current = null;

		function animate(timestamp: number) {
			if (startRef.current === null) {
				startRef.current = timestamp;
			}
			const elapsed = timestamp - startRef.current;
			const progress = Math.min(elapsed / duration, 1);
			// Ease out cubic
			const eased = 1 - (1 - progress) ** 3;
			setCurrent(Math.round(target * eased));

			if (progress < 1) {
				rafRef.current = requestAnimationFrame(animate);
			}
		}

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, [target, duration]);

	return current;
}

function StatCounter({ value, suffix, label }: StatItem) {
	const count = useCountUp(value, 1800);

	return (
		<div className="flex flex-col items-center gap-1 px-4 py-2">
			<span
				className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl"
				style={{
					fontFamily: "var(--font-display)",
					color: "var(--foreground)",
				}}
			>
				{count}
				{suffix}
			</span>
			<span
				className="text-xs uppercase tracking-wider"
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--muted-foreground)",
				}}
			>
				{label}
			</span>
		</div>
	);
}

export function HeroStats({ stats }: HeroStatsProps) {
	return (
		<div
			className="flex flex-wrap items-center justify-center gap-2 rounded-lg border px-2 py-1 sm:gap-0"
			style={{
				background: "rgba(10, 7, 16, 0.6)",
				backdropFilter: "blur(12px)",
				borderColor: "var(--border-subtle)",
			}}
		>
			{stats.map((stat, idx) => (
				<div key={stat.label} className="flex items-center">
					<StatCounter {...stat} />
					{idx < stats.length - 1 && (
						<div
							className="hidden h-8 w-px sm:block"
							style={{ background: "var(--border-subtle)" }}
						/>
					)}
				</div>
			))}
		</div>
	);
}
