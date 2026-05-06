import { supabase } from "../supabase/client";
import {
	authTokensStorage,
	refreshTokenStorage,
	userStorage,
} from "../storage";
import type { AuthTokens, User } from "../types";

type AuthProvider = "google" | "github";

function mapUser(supabaseUser: any, fallbackProvider: AuthProvider): User {
	const provider = (supabaseUser?.app_metadata?.provider ??
		fallbackProvider) as AuthProvider;
	const metadata = supabaseUser?.user_metadata ?? {};
	const name =
		metadata.full_name ??
		metadata.name ??
		metadata.preferred_username ??
		supabaseUser?.email?.split("@")[0] ??
		"User";

	return {
		id: supabaseUser.id,
		email: supabaseUser.email ?? "",
		name,
		avatar: metadata.avatar_url,
		provider,
	};
}

function mapTokens(session: any): AuthTokens {
	const expiresAt = session.expires_at
		? session.expires_at * 1000
		: Date.now() + (session.expires_in ?? 3600) * 1000;

	return {
		accessToken: session.access_token,
		refreshToken: session.refresh_token,
		expiresAt,
	};
}

async function persistAuth(user: User, tokens: AuthTokens): Promise<void> {
	await Promise.all([
		userStorage.setValue(user),
		authTokensStorage.setValue(tokens),
		refreshTokenStorage.setValue(tokens.refreshToken),
	]);
}

async function completeSessionFromRedirect(
	redirectedTo: string,
	provider: AuthProvider,
): Promise<{ user: User; tokens: AuthTokens } | null> {
	const callbackUrl = new URL(redirectedTo);
	const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));

	const callbackError =
		callbackUrl.searchParams.get("error_description") ||
		hashParams.get("error_description") ||
		callbackUrl.searchParams.get("error") ||
		hashParams.get("error");
	if (callbackError) {
		console.error("OAuth callback error:", callbackError);
		return null;
	}

	const code = callbackUrl.searchParams.get("code");
	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (error || !data.session || !data.user) {
			console.error("Code exchange failed:", error?.message);
			return null;
		}

		const user = mapUser(data.user, provider);
		const tokens = mapTokens(data.session);
		await persistAuth(user, tokens);
		return { user, tokens };
	}

	const accessToken = hashParams.get("access_token");
	const refreshToken = hashParams.get("refresh_token");
	if (!accessToken || !refreshToken) {
		console.error("OAuth callback missing access/refresh token");
		return null;
	}

	const { data, error } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});
	if (error || !data.session || !data.user) {
		console.error("Failed to set Supabase session:", error?.message);
		return null;
	}

	const user = mapUser(data.user, provider);
	const tokens = mapTokens(data.session);
	await persistAuth(user, tokens);
	return { user, tokens };
}

/**
 * Start OAuth in browser.identity and finalize a Supabase session.
 */
export async function loginWithProvider(
	provider: AuthProvider,
): Promise<{ user: User; tokens: AuthTokens } | null> {
	try {
		const redirectTo = browser.identity.getRedirectURL("supabase-auth-callback");

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo,
				skipBrowserRedirect: true,
			},
		});

		console.info("[auth] OAuth start", {
			provider,
			redirectTo,
			oauthUrl: data?.url,
			error: error?.message,
		});

		if (error || !data.url) {
			console.error("Failed to start OAuth:", error?.message);
			return null;
		}

		if (!data.url.startsWith("http")) {
			console.error("Invalid OAuth URL from Supabase:", data.url);
			return null;
		}

		const redirectedTo = await browser.identity.launchWebAuthFlow({
			url: data.url,
			interactive: true,
		});

		console.info("[auth] OAuth redirect result", { redirectedTo });

		if (!redirectedTo) {
			console.error("No redirect URL returned from launchWebAuthFlow");
			return null;
		}

		return completeSessionFromRedirect(redirectedTo, provider);
	} catch (err) {
		console.error("Login error:", err);
		return null;
	}
}

/**
 * Log the user out: revoke Supabase session and clear local auth state.
 */
export async function logout(): Promise<void> {
	try {
		await supabase.auth.signOut();
	} catch {
		// Ignore remote errors during logout
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
 * Refresh the access token using Supabase Auth and the stored refresh token.
 */
export async function refreshAccessToken(): Promise<boolean> {
	const refreshToken = await refreshTokenStorage.getValue();
	if (!refreshToken) return false;

	const { data, error } = await supabase.auth.refreshSession({
		refresh_token: refreshToken,
	});

	if (error || !data.session || !data.user) {
		console.error("Failed to refresh session:", error?.message);
		return false;
	}

	const user = mapUser(data.user, "github");
	const tokens = mapTokens(data.session);
	await persistAuth(user, tokens);
	return true;
}
