import { getTranslations } from "next-intl/server";
import { AccordionItem } from "./AccordionItem";

export async function FAQ() {
	const t = await getTranslations("faq");

	return (
		<section id="faq" className="py-24 sm:py-32 px-4">
			<div className="max-w-2xl mx-auto">
				<h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-12">
					{t("title")}
				</h2>
				<div className="space-y-2">
					<AccordionItem question={t("q0")} answer={t("a0")} />
					<AccordionItem question={t("q1")} answer={t("a1")} />
					<AccordionItem question={t("q2")} answer={t("a2")} />
					<AccordionItem question={t("q3")} answer={t("a3")} />
				</div>
			</div>
		</section>
	);
}
