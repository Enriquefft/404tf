import "@/styles/globals.css";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { PostHogPageView } from "@/lib/analytics/posthog-pageview";
import { PHProvider } from "@/lib/analytics/posthog-provider";
import { WebVitals } from "@/lib/analytics/web-vitals";
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
				<PHProvider>
					<Suspense fallback={null}>
						<PostHogPageView />
					</Suspense>
					<WebVitals />
					{children}
				</PHProvider>
			</body>
		</html>
	);
}
