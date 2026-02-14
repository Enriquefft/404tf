"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type HeroContentProps = {
	left: ReactNode;
	right: ReactNode;
};

export function HeroContent({ left, right }: HeroContentProps) {
	return (
		<div className="max-w-7xl w-full grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center relative z-10">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
			>
				{left}
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{right}
			</motion.div>
		</div>
	);
}
