"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "error" | "success" | "info";

type Toast = {
	id: string;
	message: string;
	type: ToastType;
};

type ToastContextType = {
	showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within ToastProvider");
	return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const showToast = useCallback(
		(message: string, type: ToastType = "error") => {
			const id = crypto.randomUUID();
			setToasts((prev) => [...prev, { id, message, type }]);
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 4000);
		},
		[],
	);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
				<AnimatePresence>
					{toasts.map((toast) => (
						<motion.div
							key={toast.id}
							initial={{ opacity: 0, y: -20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							className={`flex items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm shadow-lg backdrop-blur-sm ${
								toast.type === "error"
									? "border-red-500/30 bg-red-950/80 text-red-200"
									: toast.type === "success"
										? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
										: "border-cyan-500/30 bg-cyan-950/80 text-cyan-200"
							}`}
						>
							<span>{toast.message}</span>
							<button
								type="button"
								onClick={() => dismiss(toast.id)}
								className="ml-2 text-current opacity-60 hover:opacity-100"
							>
								<X size={14} />
							</button>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}
