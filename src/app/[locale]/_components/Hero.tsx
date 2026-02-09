import Image from "next/image";
import { getTranslations } from "next-intl/server";
import mascotImage from "@/assets/mascot.png";

export async function Hero() {
	const t = await getTranslations("landing.hero");

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
			{/* Background grid */}
			<div
				className="absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>

			<div className="container mx-auto px-4 relative z-10">
				<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
					<div className="flex-1 text-center lg:text-left">
						<p className="font-mono-accent text-xs tracking-[0.3em] text-primary mb-6">
							{t("eyebrow")}
						</p>

						<h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-glow-purple">
							{t("headline")}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
							{t("subtitle")}
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<a
								href="#intent-cta"
								className="gradient-purple text-primary-foreground font-semibold px-8 py-3.5 rounded-lg text-base hover:opacity-90 transition-opacity"
							>
								{t("cta1")}
							</a>
							<a
								href="#houses"
								className="border border-border text-foreground font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-muted transition-colors"
							>
								{t("cta2")}
							</a>
						</div>
					</div>

					{/* Mascot */}
					<div className="flex-shrink-0">
						<Image
							src={mascotImage}
							alt="Tardi, the 404 Tech Found mascot — a cyberpunk tardigrade in a lab coat"
							width={384}
							height={384}
							priority
							className="w-64 md:w-80 lg:w-96 drop-shadow-[0_0_30px_hsl(262_85%_50%/0.4)]"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
