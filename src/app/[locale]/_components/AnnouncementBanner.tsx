import { getTranslations } from "next-intl/server";

export async function AnnouncementBanner() {
	const t = await getTranslations("landing.banner");

	return (
		<div className="gradient-purple text-primary-foreground py-2.5 px-4 text-center text-sm font-medium relative z-50">
			<span>{t("text")} </span>
			<a
				href="https://spechack.404tf.com"
				target="_blank"
				rel="noopener"
				className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
			>
				{t("link")}
			</a>
		</div>
	);
}
