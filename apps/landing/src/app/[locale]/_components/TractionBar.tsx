"use client";

import CountUp from "react-countup";

type TractionBarProps = {
	translations: {
		community: string;
		summit: string;
		applicants: string;
		fellows: string;
	};
};

export function TractionBar({ translations }: TractionBarProps) {
	const stats = [
		{ value: 400, suffix: "+", label: translations.community },
		{ value: 250, suffix: "+", label: translations.summit },
		{ value: 92, suffix: "+", label: translations.applicants },
		{ value: 15, suffix: "", label: translations.fellows },
	];

	return (
		<section className="py-16 border-y border-border">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{stats.map((stat) => (
						<div key={stat.label} className="text-center">
							<p className="font-orbitron text-4xl md:text-5xl font-bold text-primary text-glow-purple">
								<CountUp
									end={stat.value}
									duration={2}
									enableScrollSpy
									scrollSpyOnce
									suffix={stat.suffix}
								/>
							</p>
							<p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
