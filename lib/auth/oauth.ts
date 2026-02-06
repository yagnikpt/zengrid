import { mockApi } from "../api/mock";
import {
	authTokensStorage,
	refreshTokenStorage,
	userStorage,
} from "../storage";
import type { AuthTokens, User } from "../types";

/**
 * Start the OAuth flow using browser.identity.launchWebAuthFlow.
 * For now, this uses the mock API directly (no real OAuth provider).
 *
 * When connecting to a real backend, replace the mock call with
 * a real launchWebAuthFlow + token exchange.
 */
export async function loginWithProvider(
	provider: "google" | "github",
): Promise<{ user: User; tokens: AuthTokens } | null> {
	try {
		// In a real implementation, you would:
		// 1. Build the OAuth URL for the provider
		// 2. Call browser.identity.launchWebAuthFlow({ url, interactive: true })
		// 3. Extract the auth code from the redirect URL
		// 4. Exchange the code for tokens via your backend

		// Mock: simulate the entire flow
		const mockCode = `mock-code-${Date.now()}`;
		const result = await mockApi.exchangeOAuthCode(provider, mockCode);

		if (!result.ok || !result.data) {
			console.error("OAuth failed:", result.error);
			return null;
		}

		const { user, tokens } = result.data;

		// Persist auth state
		await Promise.all([
			userStorage.setValue(user),
			authTokensStorage.setValue(tokens),
			refreshTokenStorage.setValue(tokens.refreshToken),
		]);

		return { user, tokens };
	} catch (err) {
		console.error("Login error:", err);
		return null;
	}
}

/**
 * Log the user out: clear all auth state
 */
export async function logout(): Promise<void> {
	try {
		await mockApi.logout();
	} catch {
		// Ignore API errors during logout
	}

	await Promise.all([
		userStorage.setValue(null),
		authTokensStorage.setValue(null),
		refreshTokenStorage.setValue(null),
	]);
}

/**
 * Check if current auth tokens are valid / expired
 */
export async function isTokenValid(): Promise<boolean> {
	const tokens = await authTokensStorage.getValue();
	if (!tokens) return false;
	return tokens.expiresAt > Date.now();
}

/**
 * Attempt to refresh the access token using the stored refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
	const refreshToken = await refreshTokenStorage.getValue();
	if (!refreshToken) return false;

	const result = await mockApi.refreshToken(refreshToken);
	if (!result.ok || !result.data) return false;

	await Promise.all([
		authTokensStorage.setValue(result.data),
		refreshTokenStorage.setValue(result.data.refreshToken),
	]);

	return true;
}
