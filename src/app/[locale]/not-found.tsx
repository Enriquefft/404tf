import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
	const t = useTranslations("NotFound");

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="max-w-2xl text-center">
				{/* Large 404 number with purple glow */}
				<div className="mb-8">
					<h1
						className="font-display text-9xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text"
						style={{
							textShadow: "0 0 40px rgba(168, 85, 247, 0.4)",
						}}
					>
						404
					</h1>
				</div>

				{/* Title and description */}
				<h2 className="mb-4 text-3xl font-bold text-foreground">{t("title")}</h2>
				<p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>

				{/* Back to home link */}
				<Link
					href="/"
					className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
				>
					{t("backHome")}
				</Link>
			</div>
		</div>
	);
}
