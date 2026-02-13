import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";

export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
	weight: ["400", "500", "600", "700", "800", "900"],
	display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400", "500", "600", "700"],
	display: "swap",
});
