"use client";

import { motion } from "framer-motion";

type FloatingMascotProps = {
	children: React.ReactNode;
};

export function FloatingMascot({ children }: FloatingMascotProps) {
	return (
		<motion.div
			animate={{ y: [0, -20, 0] }}
			transition={{
				duration: 3,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
		>
			{children}
		</motion.div>
	);
}
