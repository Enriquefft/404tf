"use client";

import { motion } from "framer-motion";

type FadeInSectionProps = {
	children: React.ReactNode;
	className?: string;
};

export function FadeInSection({ children, className }: FadeInSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, margin: "-80px" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
