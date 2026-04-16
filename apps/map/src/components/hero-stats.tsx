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
		<div className="flex flex-col items-center gap-1.5 px-6 py-3 sm:px-8">
			<span
				className="font-semibold tabular-nums leading-none tracking-tight"
				style={{
					fontFamily: "var(--font-mono)",
					color: "var(--foreground)",
					fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)",
				}}
			>
				{count}
				{suffix}
			</span>
			<span
				className="text-[10px] uppercase sm:text-[11px]"
				style={{
					fontFamily: "var(--font-mono)",
					color: "var(--muted-foreground)",
					letterSpacing: "0.26em",
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
			className="flex flex-wrap items-center justify-center gap-0 border px-1 py-1 sm:gap-0"
			style={{
				background: "rgba(10, 7, 16, 0.55)",
				backdropFilter: "blur(12px)",
				WebkitBackdropFilter: "blur(12px)",
				borderColor: "var(--border-subtle)",
				borderRadius: 0,
			}}
		>
			{stats.map((stat, idx) => (
				<div key={stat.label} className="flex items-center">
					<StatCounter {...stat} />
					{idx < stats.length - 1 && (
						<div
							className="hidden h-10 w-px sm:block"
							style={{ background: "var(--border-strong)" }}
							aria-hidden="true"
						/>
					)}
				</div>
			))}
		</div>
	);
}
