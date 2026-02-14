import { Code2, FileText, Presentation } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { MotionDiv } from "./animations";

/**
 * Renders text with {bold} markers as <strong> elements
 */
function renderBold(text: string) {
	const parts = text.split(/(\{bold\}|\{\/bold\})/g);
	const elements: ReactNode[] = [];
	let isBold = false;
	let boldContent = "";

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (part === "{bold}") {
			isBold = true;
			boldContent = "";
		} else if (part === "{/bold}") {
			if (boldContent) {
				elements.push(<strong key={`bold-${i}`}>{boldContent}</strong>);
			}
			isBold = false;
			boldContent = "";
		} else if (isBold) {
			boldContent += part;
		} else if (part) {
			elements.push(part);
		}
	}

	return elements;
}

export async function Manifesto() {
	const t = await getTranslations("manifesto");
	const phases = await getTranslations("phases");

	const phaseData = [
		{
			icon: FileText,
			name: phases("p1Name"),
			days: phases("p1Days"),
			desc: phases("p1Desc"),
		},
		{
			icon: Code2,
			name: phases("p2Name"),
			days: phases("p2Days"),
			desc: phases("p2Desc"),
		},
		{
			icon: Presentation,
			name: phases("p3Name"),
			days: phases("p3Days"),
			desc: phases("p3Desc"),
		},
	];

	return (
		<section id="manifesto" className="py-24 sm:py-32 px-4">
			{/* Manifesto Text */}
			<div className="max-w-3xl mx-auto space-y-6">
				<p className="text-lg text-muted-foreground leading-relaxed">
					{renderBold(t.raw("p1"))}
				</p>
				<p className="text-lg text-muted-foreground leading-relaxed">
					{renderBold(t.raw("p2"))}
				</p>
				<p className="text-center font-mono text-sm text-muted-foreground mt-12">
					{t("bridge")}
				</p>
			</div>

			{/* Phase Cards */}
			<div id="how-it-works" className="max-w-6xl mx-auto mt-16">
				<div className="grid md:grid-cols-3 gap-8 relative">
					{phaseData.map((phase, index) => {
						const Icon = phase.icon;
						return (
							<MotionDiv
								key={phase.name}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.6, delay: index * 0.15 }}
							>
								<div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4 h-full">
									<Icon className="w-8 h-8 text-primary" />
									<h3 className="font-orbitron font-bold text-xl">
										{phase.name}
									</h3>
									<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
										{phase.days}
									</p>
									<p className="text-muted-foreground">{phase.desc}</p>
								</div>

								{/* Connector Line (Desktop Only) */}
								{index < phaseData.length - 1 && (
									<div
										className="hidden md:block absolute top-16 w-8 h-px bg-border"
										style={{ left: `${(index + 1) * 33.33 - 4}%` }}
									/>
								)}
							</MotionDiv>
						);
					})}
				</div>

				{/* Bottom Note */}
				<div className="mt-12 text-center space-y-4">
					<p className="text-muted-foreground">{phases("note")}</p>
					<a
						href="#register"
						className="inline-block font-mono text-sm text-primary hover:text-primary/80 transition-colors"
					>
						{phases("registerUp")}
					</a>
				</div>
			</div>
		</section>
	);
}
