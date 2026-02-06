import type {
	ApiResponse,
	AuthTokens,
	GridState,
	SyncResult,
	User,
} from "../types";
import { authTokensStorage } from "../storage";
import { API_BASE_URL } from "../constants";

/**
 * API client with auth token injection.
 * All requests go through this wrapper to attach Authorization headers.
 */
async function request<T>(
	path: string,
	options: RequestInit = {},
): Promise<ApiResponse<T>> {
	try {
		const tokens = await authTokensStorage.getValue();
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		if (tokens?.accessToken) {
			headers["Authorization"] = `Bearer ${tokens.accessToken}`;
		}

		const response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const errorBody = await response.text();
			return { ok: false, error: errorBody || response.statusText };
		}

		const data = await response.json();
		return { ok: true, data };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return { ok: false, error: message };
	}
}

// ── Public API methods ──────────────────────────────────────

export const api = {
	/** Fetch the user's grid state from the server */
	async getGrid(): Promise<ApiResponse<GridState>> {
		return request<GridState>("/grid");
	},

	/** Save the user's grid state to the server */
	async saveGrid(gridState: GridState): Promise<ApiResponse<SyncResult>> {
		return request<SyncResult>("/grid", {
			method: "PUT",
			body: JSON.stringify(gridState),
		});
	},

	/** Get current user profile */
	async getUser(): Promise<ApiResponse<User>> {
		return request<User>("/user");
	},

	/** Exchange OAuth code for tokens */
	async exchangeOAuthCode(
		provider: "google" | "github",
		code: string,
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		return request("/auth/oauth", {
			method: "POST",
			body: JSON.stringify({ provider, code }),
		});
	},

	/** Refresh the access token */
	async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
		return request("/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});
	},

	/** Logout */
	async logout(): Promise<ApiResponse<void>> {
		return request("/auth/logout", { method: "POST" });
	},
};
