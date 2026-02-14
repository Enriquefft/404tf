"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type StickyRegisterButtonProps = {
	label: string;
};

export function StickyRegisterButton({ label }: StickyRegisterButtonProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const hero = document.getElementById("register");
		if (!hero) return;

		const observer = new IntersectionObserver(
			([entry]) => setVisible(!entry.isIntersecting),
			{ threshold: 0.1 },
		);
		observer.observe(hero);
		return () => observer.disconnect();
	}, []);

	return (
		<AnimatePresence>
			{visible && (
				<motion.a
					href="#register"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.2 }}
					className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground font-mono text-sm px-6 py-3 rounded-md shadow-lg hover:opacity-90 transition-opacity"
				>
					{label}
				</motion.a>
			)}
		</AnimatePresence>
	);
}
