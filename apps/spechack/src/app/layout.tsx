import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SpecHack - Coming Soon",
	description: "404 Tech Found hackathon platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
