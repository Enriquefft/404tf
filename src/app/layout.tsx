import "@/styles/globals.css";
import "@/env/client";
import { getLocale } from "next-intl/server";
import { cn } from "@/lib/utils";
import { inter, orbitron } from "@/styles/fonts";

type Props = {
	children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
	const locale = await getLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					inter.variable,
					orbitron.variable,
				)}
			>
				{children}
			</body>
		</html>
	);
}
