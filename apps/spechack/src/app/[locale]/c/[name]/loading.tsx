export default function ChallengeLoading() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
			{/* Challenge header shimmer */}
			<div className="mb-8 flex flex-col items-center gap-4">
				<div className="h-8 w-64 animate-pulse rounded-lg bg-white/5" />
				<div className="h-6 w-48 animate-pulse rounded-lg bg-white/5" />
			</div>

			{/* Card shimmer */}
			<div className="h-[420px] w-[300px] animate-pulse rounded-2xl border border-white/5 bg-white/5" />

			{/* CTA shimmer */}
			<div className="mt-8 flex flex-col items-center gap-3">
				<div className="h-6 w-56 animate-pulse rounded-lg bg-white/5" />
				<div className="h-12 w-40 animate-pulse rounded-xl bg-white/5" />
			</div>
		</main>
	);
}
