"use client";

import { useTranslations } from "next-intl";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ChallengeError({ error, reset }: ErrorProps) {
	const t = useTranslations("errors");

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
			<div className="flex flex-col items-center gap-6 text-center">
				<div className="font-mono text-6xl text-red-500/40">!</div>
				<h1 className="font-orbitron text-2xl font-bold text-white">
					{t("somethingWentWrong")}
				</h1>
				<p className="max-w-md font-mono text-sm text-muted-foreground">
					{t("generic")}
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 font-mono text-sm text-cyan-300 transition-colors hover:bg-cyan-500/20"
				>
					{t("retry")}
				</button>
			</div>
		</main>
	);
}
