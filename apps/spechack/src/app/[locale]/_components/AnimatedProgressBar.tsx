"use client";

import { motion } from "framer-motion";

type AnimatedProgressBarProps = {
	label: string;
	pct: number;
	delay?: number;
};

export function AnimatedProgressBar({
	label,
	pct,
	delay = 0,
}: AnimatedProgressBarProps) {
	return (
		<div>
			<div className="flex justify-between items-center mb-1.5">
				<span className="font-mono text-xs text-muted-foreground">{label}</span>
				<span className="font-mono text-xs text-primary">{pct}%</span>
			</div>
			<div className="h-2 bg-muted rounded-full overflow-hidden">
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${pct}%` }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 + delay, duration: 0.8, ease: "easeOut" }}
					className="h-full bg-primary rounded-full"
				/>
			</div>
		</div>
	);
}
