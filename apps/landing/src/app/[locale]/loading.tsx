export default function Loading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center">
				{/* Spinner */}
				<div
					className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/20 border-t-purple-500"
					aria-hidden="true"
				/>
				{/* Screen reader text */}
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
}
