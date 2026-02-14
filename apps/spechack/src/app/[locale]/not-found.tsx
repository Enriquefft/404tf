"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
	const t = useTranslations("NotFound");

	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="text-center">
				<h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					404
				</h1>
				<h2 className="text-2xl font-bold mt-4">{t("title")}</h2>
				<p className="text-muted-foreground mt-2">{t("description")}</p>
				<Link
					href="/"
					className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
				>
					{t("backHome")}
				</Link>
			</div>
		</div>
	);
}
