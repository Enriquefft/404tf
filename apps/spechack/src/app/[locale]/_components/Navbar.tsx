"use client";

import { Squash as Hamburger } from "hamburger-react";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { usePathname, useRouter } from "@/i18n/navigation";

type NavbarProps = {
	locale: "es" | "en";
	translations: {
		challenge: string;
		howItWorks: string;
		prizes: string;
		hubs: string;
		faq: string;
		sponsor: string;
		register: string;
	};
};

export function Navbar({ locale, translations }: NavbarProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrollY, setScrollY] = useState(0);
	const scrollDirection = useScrollDirection();
	const router = useRouter();
	const pathname = usePathname();

	// Track scroll position for background opacity
	if (typeof window !== "undefined") {
		window.addEventListener("scroll", () => setScrollY(window.scrollY), {
			passive: true,
		});
	}

	const isScrolled = scrollY > 50;

	const navLinks = [
		{ label: translations.challenge, href: "#manifesto" },
		{ label: translations.howItWorks, href: "#how-it-works" },
		{ label: translations.prizes, href: "#prizes" },
		{ label: translations.hubs, href: "#hubs" },
		{ label: translations.faq, href: "#faq" },
		{ label: translations.sponsor, href: "#sponsors" },
	];

	const handleLinkClick = () => {
		setMobileMenuOpen(false);
	};

	const handleLanguageSwitch = (newLocale: "es" | "en") => {
		router.replace(pathname, { locale: newLocale, scroll: false });
	};

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
			} ${isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent"}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<a href="#register" className="flex flex-col items-start">
						<span className="font-orbitron font-bold text-lg">SpecHack</span>
						<span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
							by 404 Tech Found
						</span>
					</a>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-6">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								{link.label}
							</a>
						))}

						{/* Language Switcher */}
						<div className="flex items-center gap-2 font-mono-accent text-xs">
							<button
								type="button"
								onClick={() => handleLanguageSwitch("es")}
								className={
									locale === "es"
										? "font-bold text-foreground"
										: "text-muted-foreground"
								}
							>
								ES
							</button>
							<span className="text-muted-foreground">|</span>
							<button
								type="button"
								onClick={() => handleLanguageSwitch("en")}
								className={
									locale === "en"
										? "font-bold text-foreground"
										: "text-muted-foreground"
								}
							>
								EN
							</button>
						</div>

						{/* Register CTA */}
						<a
							href="#register"
							className="bg-primary text-primary-foreground font-mono text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
						>
							{translations.register}
						</a>
					</div>

					{/* Mobile Hamburger */}
					<div className="md:hidden">
						<Hamburger
							toggled={mobileMenuOpen}
							toggle={setMobileMenuOpen}
							size={20}
						/>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={handleLinkClick}
								className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								{link.label}
							</a>
						))}

						{/* Mobile Language Switcher */}
						<div className="flex items-center gap-2 font-mono-accent text-xs">
							<button
								type="button"
								onClick={() => {
									handleLanguageSwitch("es");
									handleLinkClick();
								}}
								className={
									locale === "es"
										? "font-bold text-foreground"
										: "text-muted-foreground"
								}
							>
								ES
							</button>
							<span className="text-muted-foreground">|</span>
							<button
								type="button"
								onClick={() => {
									handleLanguageSwitch("en");
									handleLinkClick();
								}}
								className={
									locale === "en"
										? "font-bold text-foreground"
										: "text-muted-foreground"
								}
							>
								EN
							</button>
						</div>

						{/* Mobile Register CTA */}
						<a
							href="#register"
							onClick={handleLinkClick}
							className="bg-primary text-primary-foreground font-mono text-xs px-4 py-2 rounded-md text-center hover:opacity-90 transition-opacity"
						>
							{translations.register}
						</a>
					</div>
				</div>
			)}
		</nav>
	);
}
