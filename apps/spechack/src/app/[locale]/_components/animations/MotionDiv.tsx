"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

type MotionDivProps = HTMLMotionProps<"div"> & {
	children?: React.ReactNode;
};

export function MotionDiv({ children, ...props }: MotionDivProps) {
	return <motion.div {...props}>{children}</motion.div>;
}
