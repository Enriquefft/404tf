import { Barlow_Semi_Condensed, Big_Shoulders, JetBrains_Mono } from "next/font/google";

export const bigShouldersDisplay = Big_Shoulders({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
	adjustFontFallback: false,
});

export const barlowSemiCondensed = Barlow_Semi_Condensed({
	subsets: ["latin"],
	variable: "--font-body",
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});
