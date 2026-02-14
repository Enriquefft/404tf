import { getLocale, getTranslations } from "next-intl/server";
import { HeroContent } from "./HeroContent";
import { RegistrationForm } from "./RegistrationForm";

export async function Hero() {
	const t = await getTranslations("hero");
	const locale = (await getLocale()) as "es" | "en";

	return (
		<section
			id="register"
			className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden pt-20 pb-8"
		>
			{/* Radial gradient decorations */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

			{/* Content Grid with Staggered Animation */}
			<HeroContent
				left={
					<div className="space-y-6">
						<p className="font-mono uppercase tracking-[0.3em] text-xs text-muted-foreground">
							{t("eyebrow")}
						</p>
						<h1 className="font-orbitron font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight">
							{t("headline")}
						</h1>
						<p className="text-lg text-muted-foreground">{t("sub")}</p>
						<p className="font-mono text-sm text-muted-foreground">
							{t("date")}
						</p>
						<a
							href="#manifesto"
							className="inline-block font-mono text-sm text-primary hover:text-primary/80 transition-colors"
						>
							{t("howLink")}
						</a>
					</div>
				}
				right={
					<RegistrationForm
						locale={locale}
						translations={{
							formTitle: t("formTitle"),
							formName: t("formName"),
							formEmail: t("formEmail"),
							formCity: t("formCity"),
							trackVirtual: t("trackVirtual"),
							trackHub: t("trackHub"),
							trackVirtualHelper: t("trackVirtualHelper"),
							trackHubHelper: t("trackHubHelper"),
							submit: t("submit"),
							formNote: t("formNote"),
							successTitle: t("successTitle"),
							successSub: t("successSub"),
						}}
					/>
				}
			/>
		</section>
	);
}
