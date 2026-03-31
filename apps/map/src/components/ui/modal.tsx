import { type ReactNode, useCallback, useEffect, useRef } from "react";

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const previousActiveRef = useRef<Element | null>(null);

	const handleEscape = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	// Body scroll lock + keyboard listener
	useEffect(() => {
		if (!isOpen) return;

		previousActiveRef.current = document.activeElement;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleEscape);

		// Focus the dialog container
		const timer = requestAnimationFrame(() => {
			dialogRef.current?.focus();
		});

		return () => {
			document.body.style.overflow = "";
			document.removeEventListener("keydown", handleEscape);
			cancelAnimationFrame(timer);

			// Restore focus to previously active element
			if (previousActiveRef.current instanceof HTMLElement) {
				previousActiveRef.current.focus();
			}
		};
	}, [isOpen, handleEscape]);

	// Focus trap
	const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab" || !dialogRef.current) return;

		const focusableSelectors = [
			"a[href]",
			"button:not([disabled])",
			"textarea:not([disabled])",
			"input:not([disabled])",
			"select:not([disabled])",
			"[tabindex]:not([tabindex='-1'])",
		].join(", ");

		const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors);

		if (focusableElements.length === 0) return;

		const first = focusableElements[0];
		const last = focusableElements[focusableElements.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}, []);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="presentation">
			{/* Backdrop — button for a11y click-to-close */}
			<button
				type="button"
				className="absolute inset-0 bg-black/60 cursor-default"
				onClick={onClose}
				aria-label="Close dialog"
				tabIndex={-1}
				style={{
					animation: "modal-backdrop-in 200ms ease-out both",
				}}
			/>

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border outline-none"
				style={{
					background: "var(--popover)",
					borderColor: "var(--border)",
					borderRadius: "var(--radius-lg)",
					animation: "modal-content-in 200ms ease-out both",
				}}
			>
				{/* Header */}
				{title && (
					<div
						className="flex items-center justify-between border-b px-6 py-4"
						style={{ borderColor: "var(--border-subtle)" }}
					>
						<h2
							className="text-lg font-semibold"
							style={{
								fontFamily: "var(--font-heading)",
								color: "var(--foreground)",
							}}
						>
							{title}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
							style={{
								color: "var(--muted-foreground)",
								borderRadius: "var(--radius-md)",
							}}
							aria-label="Close"
						>
							{/* Solar: Close Circle Linear */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M14.5 9.5l-5 5m0-5l5 5" />
								<circle cx="12" cy="12" r="10" />
							</svg>
						</button>
					</div>
				)}

				{/* Close button when no title */}
				{!title && (
					<button
						type="button"
						onClick={onClose}
						className="absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
						style={{
							color: "var(--muted-foreground)",
							borderRadius: "var(--radius-md)",
						}}
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M14.5 9.5l-5 5m0-5l5 5" />
							<circle cx="12" cy="12" r="10" />
						</svg>
					</button>
				)}

				{/* Body */}
				<div className="p-6">{children}</div>
			</div>

			{/* Animation keyframes injected once */}
			<style>{`
				@keyframes modal-backdrop-in {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes modal-content-in {
					from { opacity: 0; transform: scale(0.95); }
					to { opacity: 1; transform: scale(1); }
				}
			`}</style>
		</div>
	);
}
