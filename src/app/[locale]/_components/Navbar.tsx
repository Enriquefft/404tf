import { Menu } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import logoWhite from "@/assets/logo-white.png";

export async function Navbar() {
	const t = await getTranslations("landing.nav");

	const navLinks = [
		{ label: t("about"), target: "houses" },
		{ label: t("programs"), target: "programs" },
		{ label: t("community"), target: "community" },
		{ label: t("events"), target: "events" },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
			<div className="container mx-auto flex items-center justify-between h-16 px-4">
				<Image src={logoWhite} alt="404 Tech Found" className="h-8" width={128} height={32} />

				{/* Desktop nav */}
				<div className="hidden md:flex items-center gap-6">
					{navLinks.map((link) => (
						<a
							key={link.target}
							href={`#${link.target}`}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{link.label}
						</a>
					))}
					<a
						href="https://spechack.404tf.com"
						target="_blank"
						rel="noopener"
						className="text-sm text-foreground font-medium flex items-center gap-1.5"
					>
						SpecHack
						<span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
							NEW
						</span>
					</a>
					<span className="text-xs font-mono-accent border border-border rounded px-2 py-1">
						ES | EN
					</span>
					<a
						href="#intent-cta"
						className="gradient-purple text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
					>
						{t("cta")}
					</a>
				</div>

				{/* Mobile toggle */}
				<div className="md:hidden p-2 text-foreground">
					<Menu className="h-5 w-5" />
				</div>
			</div>
		</nav>
	);
}
