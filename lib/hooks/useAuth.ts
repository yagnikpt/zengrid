import { useState, useEffect, useCallback } from "react";
import { userStorage, authTokensStorage } from "../storage";
import {
	isTokenValid,
	loginWithProvider,
	logout as doLogout,
	refreshAccessToken,
} from "../auth/oauth";
import type { User } from "../types";

/**
 * Hook for managing authentication state.
 * Loads cached user on mount, provides login/logout actions.
 */
export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// ── Load cached auth on mount ───────────────────────────
	useEffect(() => {
		let cancelled = false;

		async function loadAuth() {
			try {
				const cachedUser = await userStorage.getValue();
				if (!cancelled) {
					setUser(cachedUser);
					setIsLoading(false);
				}

				if (!cachedUser) return;

				const hasValidToken = await isTokenValid();
				if (hasValidToken) return;

				// Browser restart / extension update clears session storage.
				// Restore in background so new tab opens instantly from local state.
				const refreshed = await refreshAccessToken();
				if (refreshed) {
					const restoredUser = await userStorage.getValue();
					if (!cancelled) setUser(restoredUser ?? cachedUser);
					return;
				}

				await Promise.all([
					userStorage.setValue(null),
					authTokensStorage.setValue(null),
				]);
				if (!cancelled) setUser(null);
			} catch (err) {
				console.warn("Failed to load user from storage:", err);
				if (!cancelled) {
					setUser(null);
					setIsLoading(false);
				}
			}
		}

		loadAuth();

		// Watch for auth changes (e.g., login from popup)
		let unwatchUser: (() => void) | undefined;
		try {
			unwatchUser = userStorage.watch((newUser: User | null) => {
				if (!cancelled) {
					setUser(newUser);
				}
			});
		} catch (err) {
			console.warn("Failed to watch user storage:", err);
		}

		return () => {
			cancelled = true;
			unwatchUser?.();
		};
	}, []);

	// ── Login ───────────────────────────────────────────────
	const login = useCallback(async (provider: "google" | "github") => {
		setIsLoggingIn(true);
		setError(null);

		try {
			const result = await loginWithProvider(provider);
			if (result) {
				setUser(result.user);
			} else {
				setError("Login failed. Please try again.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsLoggingIn(false);
		}
	}, []);

	// ── Logout ──────────────────────────────────────────────
	const logout = useCallback(async () => {
		await doLogout();
		setUser(null);
	}, []);

	return {
		user,
		isAuthenticated: user !== null,
		isLoading,
		isLoggingIn,
		error,
		login,
		logout,
	};
}
