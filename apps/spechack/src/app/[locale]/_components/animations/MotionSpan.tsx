"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

type MotionSpanProps = HTMLMotionProps<"span"> & {
	children?: React.ReactNode;
};

export function MotionSpan({ children, ...props }: MotionSpanProps) {
	return <motion.span {...props}>{children}</motion.span>;
}
