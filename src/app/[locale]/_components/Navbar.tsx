"use client";

import { clsx } from "clsx";
import { Squash as Hamburger } from "hamburger-react";
import Image from "next/image";
import { useState } from "react";
import logoWhite from "@/assets/logo-white.png";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { usePathname, useRouter } from "@/i18n/navigation";

type NavbarProps = {
	locale: "es" | "en";
	translations: {
		about: string;
		programs: string;
		community: string;
		events: string;
		cta: string;
	};
};

export function Navbar({ locale, translations }: NavbarProps) {
	const scrollDirection = useScrollDirection();
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const navLinks = [
		{ label: translations.about, target: "houses" },
		{ label: translations.programs, target: "programs" },
		{ label: translations.community, target: "community" },
		{ label: translations.events, target: "events" },
	];

	const handleLanguageSwitch = (newLocale: "es" | "en") => {
		router.replace(pathname, { locale: newLocale, scroll: false });
	};

	const handleNavLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<nav
			className={clsx(
				"fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border",
				"transition-transform duration-300",
				scrollDirection === "down" && "-translate-y-full",
			)}
		>
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

					{/* Language switcher */}
					<div className="text-xs font-mono-accent border border-border rounded px-2 py-1 flex items-center gap-1.5">
						<button
							type="button"
							onClick={() => handleLanguageSwitch("es")}
							className={clsx(
								"transition-colors",
								locale === "es"
									? "font-bold text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							ES
						</button>
						<span className="text-muted-foreground">|</span>
						<button
							type="button"
							onClick={() => handleLanguageSwitch("en")}
							className={clsx(
								"transition-colors",
								locale === "en"
									? "font-bold text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							EN
						</button>
					</div>

					<a
						href="#intent-cta"
						className="gradient-purple text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
					>
						{translations.cta}
					</a>
				</div>

				{/* Mobile toggle */}
				<div className="md:hidden">
					<Hamburger toggled={isOpen} toggle={setIsOpen} size={20} color="hsl(var(--foreground))" />
				</div>
			</div>

			{/* Mobile menu panel */}
			{isOpen && (
				<div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
					<div className="container mx-auto px-4 py-4 flex flex-col gap-4">
						{navLinks.map((link) => (
							<a
								key={link.target}
								href={`#${link.target}`}
								onClick={handleNavLinkClick}
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

						{/* Mobile language switcher */}
						<div className="text-xs font-mono-accent border border-border rounded px-2 py-1 flex items-center gap-1.5 w-fit">
							<button
								type="button"
								onClick={() => handleLanguageSwitch("es")}
								className={clsx(
									"transition-colors",
									locale === "es"
										? "font-bold text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								ES
							</button>
							<span className="text-muted-foreground">|</span>
							<button
								type="button"
								onClick={() => handleLanguageSwitch("en")}
								className={clsx(
									"transition-colors",
									locale === "en"
										? "font-bold text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								EN
							</button>
						</div>

						{/* biome-ignore lint/a11y/useValidAnchor: This is a valid anchor navigation to #intent-cta section */}
						<a
							href="#intent-cta"
							onClick={handleNavLinkClick}
							className="gradient-purple text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-center"
						>
							{translations.cta}
						</a>
					</div>
				</div>
			)}
		</nav>
	);
}
