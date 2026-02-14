import { useCallback, useEffect, useRef, useState } from "react";
import { GYRO_MAX_TILT } from "./constants";

type GyroState = {
	beta: number;
	gamma: number;
};

export function useGyroscope() {
	const [supported, setSupported] = useState(false);
	const [enabled, setEnabled] = useState(false);
	const orientation = useRef<GyroState>({ beta: 0, gamma: 0 });

	useEffect(() => {
		setSupported(typeof DeviceOrientationEvent !== "undefined");
	}, []);

	const requestPermission = useCallback(async () => {
		try {
			// iOS 13+ requires permission request
			const DOE = DeviceOrientationEvent as unknown as {
				requestPermission?: () => Promise<string>;
			};
			if (typeof DOE.requestPermission === "function") {
				const permission = await DOE.requestPermission();
				if (permission !== "granted") return false;
			}
			setEnabled(true);
			return true;
		} catch {
			return false;
		}
	}, []);

	useEffect(() => {
		if (!enabled) return;

		const handler = (e: DeviceOrientationEvent) => {
			const beta = ((e.beta ?? 0) / 90) * GYRO_MAX_TILT;
			const gamma = ((e.gamma ?? 0) / 90) * GYRO_MAX_TILT;
			orientation.current = {
				beta: Math.max(-GYRO_MAX_TILT, Math.min(GYRO_MAX_TILT, beta)),
				gamma: Math.max(-GYRO_MAX_TILT, Math.min(GYRO_MAX_TILT, gamma)),
			};
		};

		window.addEventListener("deviceorientation", handler);
		return () => window.removeEventListener("deviceorientation", handler);
	}, [enabled]);

	return { supported, enabled, orientation, requestPermission };
}
