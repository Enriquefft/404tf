"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe hook to persist state in localStorage
 *
 * Keys should use the `404tf:` namespace prefix, e.g.:
 * - `404tf:announcement-spechack:dismissed`
 * - `404tf:theme`
 *
 * @param key - localStorage key (should be namespaced with "404tf:")
 * @param initialValue - default value used during SSR and before localStorage is read
 * @returns tuple of [storedValue, setValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
	// Initialize with initialValue (same on server and client to avoid hydration mismatch)
	const [storedValue, setStoredValue] = useState<T>(initialValue);

	// Read from localStorage AFTER hydration (client-only)
	useEffect(() => {
		try {
			const item = window.localStorage.getItem(key);
			if (item) {
				setStoredValue(JSON.parse(item));
			}
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
		}
	}, [key]);

	// Wrapped setter that updates both state and localStorage
	const setValue = (value: T) => {
		try {
			setStoredValue(value);
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(`Error setting localStorage key "${key}":`, error);
		}
	};

	return [storedValue, setValue];
}
