import { getTranslations } from "next-intl/server";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/metadata/seo-config";
import { Logo } from "./Logo";

export async function Footer() {
	const t = await getTranslations("landing.footer");
	const tNav = await getTranslations("landing.nav");

	const navLinks = [
		{ label: tNav("about"), target: "houses" },
		{ label: tNav("programs"), target: "programs" },
		{ label: tNav("community"), target: "community" },
		{ label: tNav("events"), target: "events" },
	];

	return (
		<footer className="border-t border-border py-16">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row items-start justify-between gap-10">
					<div>
						<Logo className="text-lg mb-3" />
						<p className="text-sm text-muted-foreground font-mono-accent">{t("tagline")}</p>
					</div>

					<div className="flex flex-wrap gap-6">
						{navLinks.map((link) => (
							<a
								key={link.target}
								href={`#${link.target}`}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{link.label}
							</a>
						))}
					</div>

					<div className="text-sm text-muted-foreground space-y-1">
						<a
							href={`mailto:${CONTACT_EMAIL}`}
							className="hover:text-foreground transition-colors block"
						>
							{CONTACT_EMAIL}
						</a>
						<p>{t("location")}</p>
						{/* Social icons */}
						<div className="flex gap-3 pt-2">
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								LinkedIn
							</a>
							<a
								href={SOCIAL_LINKS.twitter}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								X
							</a>
							<a
								href={SOCIAL_LINKS.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								Instagram
							</a>
							<a
								href={SOCIAL_LINKS.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								YouTube
							</a>
						</div>
					</div>
				</div>

				<div className="mt-10 pt-6 border-t border-border text-center">
					<p className="text-xs text-muted-foreground">{t("rights")}</p>
				</div>
			</div>
		</footer>
	);
}
