import type {
	ApiResponse,
	AuthTokens,
	GridState,
	SyncResult,
	User,
} from "../types";
import { createEmptyGrid } from "../grid-utils";

/**
 * Mock API implementation.
 * Replace with real API calls by swapping imports from './mock' to './client'.
 */

// In-memory mock database
let mockUser: User | null = null;
let mockGrid: GridState = createEmptyGrid();

// Simulate network delay
function delay(ms = 200): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
	async getGrid(): Promise<ApiResponse<GridState>> {
		await delay();
		return { ok: true, data: { ...mockGrid } };
	},

	async saveGrid(gridState: GridState): Promise<ApiResponse<SyncResult>> {
		await delay();
		mockGrid = { ...gridState, updatedAt: Date.now() };
		return {
			ok: true,
			data: {
				gridState: mockGrid,
				serverUpdatedAt: mockGrid.updatedAt,
			},
		};
	},

	async getUser(): Promise<ApiResponse<User>> {
		await delay();
		if (!mockUser) {
			return { ok: false, error: "Not authenticated" };
		}
		return { ok: true, data: { ...mockUser } };
	},

	async exchangeOAuthCode(
		provider: "google" | "github",
		_code: string,
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		await delay(500);

		// Mock successful OAuth
		mockUser = {
			id: "mock-user-1",
			email: `user@${provider}.com`,
			name: `Mock ${provider === "google" ? "Google" : "GitHub"} User`,
			avatar: undefined,
			provider,
		};

		const tokens: AuthTokens = {
			accessToken: `mock-access-token-${Date.now()}`,
			refreshToken: `mock-refresh-token-${Date.now()}`,
			expiresAt: Date.now() + 3600 * 1000, // 1 hour
		};

		return {
			ok: true,
			data: { user: mockUser, tokens },
		};
	},

	async refreshToken(_refreshToken: string): Promise<ApiResponse<AuthTokens>> {
		await delay();
		return {
			ok: true,
			data: {
				accessToken: `mock-access-token-${Date.now()}`,
				refreshToken: `mock-refresh-token-${Date.now()}`,
				expiresAt: Date.now() + 3600 * 1000,
			},
		};
	},

	async logout(): Promise<ApiResponse<void>> {
		await delay();
		mockUser = null;
		return { ok: true };
	},
};
