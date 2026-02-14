import { useFrame } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import { PHASE_MATERIALIZE_END, PHASE_SIGNAL_LOCK } from "./constants";

export type RevealPhase = "signal-lock" | "materialize" | "interactive";

type RevealState = {
	phase: RevealPhase;
	elapsed: number;
	/** 0-1 progress for materialize scan-line sweep */
	revealProgress: number;
};

export function useRevealState(onComplete?: () => void) {
	const [state, setState] = useState<RevealState>({
		phase: "signal-lock",
		elapsed: 0,
		revealProgress: 0,
	});
	const completedRef = useRef(false);

	useFrame((_, delta) => {
		setState((prev) => {
			const elapsed = prev.elapsed + delta;

			if (elapsed < PHASE_SIGNAL_LOCK) {
				return { phase: "signal-lock", elapsed, revealProgress: 0 };
			}

			if (elapsed < PHASE_MATERIALIZE_END) {
				const progress =
					(elapsed - PHASE_SIGNAL_LOCK) /
					(PHASE_MATERIALIZE_END - PHASE_SIGNAL_LOCK);
				return { phase: "materialize", elapsed, revealProgress: progress };
			}

			if (!completedRef.current) {
				completedRef.current = true;
				onComplete?.();
			}

			return { phase: "interactive", elapsed, revealProgress: 1 };
		});
	});

	const reset = useCallback(() => {
		completedRef.current = false;
		setState({ phase: "signal-lock", elapsed: 0, revealProgress: 0 });
	}, []);

	return { ...state, reset };
}
