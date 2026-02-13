"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

type MotionSectionProps = HTMLMotionProps<"section"> & {
	children?: React.ReactNode;
};

export function MotionSection({ children, ...props }: MotionSectionProps) {
	return <motion.section {...props}>{children}</motion.section>;
}
