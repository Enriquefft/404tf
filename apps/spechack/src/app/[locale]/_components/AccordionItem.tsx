"use client";

import { useState } from "react";

type AccordionItemProps = {
	question: string;
	answer: string;
};

export function AccordionItem({ question, answer }: AccordionItemProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="border border-border rounded-lg px-4 bg-card">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="cursor-pointer py-4 w-full font-mono text-sm hover:text-foreground transition-colors flex justify-between items-center text-left"
				aria-expanded={open}
			>
				{question}
				<span
					className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				>
					▾
				</span>
			</button>
			<div
				className="grid transition-[grid-template-rows] duration-200 ease-out"
				style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
			>
				<div className="overflow-hidden">
					<div className="pb-4 text-muted-foreground text-sm">{answer}</div>
				</div>
			</div>
		</div>
	);
}
