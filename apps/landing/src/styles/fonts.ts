import { Inter, Orbitron } from "next/font/google";

export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

export const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
	weight: ["400", "500", "600", "700", "800", "900"],
	display: "swap",
});
