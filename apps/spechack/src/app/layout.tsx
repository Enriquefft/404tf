import "@/styles/globals.css";
import { getLocale } from "next-intl/server";
import { cn } from "@/lib/utils";
import { inter, jetbrainsMono, orbitron } from "@/styles/fonts";

type Props = {
	children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
	const locale = await getLocale();

	return (
		<html
			lang={locale}
			className={cn(inter.variable, orbitron.variable, jetbrainsMono.variable)}
		>
			<body className="min-h-screen bg-background font-sans antialiased blueprint-grid">
				{children}
			</body>
		</html>
	);
}
