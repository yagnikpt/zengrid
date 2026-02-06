import { storage } from "wxt/utils/storage";
import type { GridState, User, AuthTokens } from "./types";
import { TOTAL_CELLS } from "./constants";
import { createEmptyGrid } from "./grid-utils";

// ── Grid State (persistent local cache) ─────────────────────

export const gridStateStorage = storage.defineItem<GridState>(
	"local:gridState",
	{
		fallback: createEmptyGrid(),
	},
);

// ── User Profile (persistent local cache) ───────────────────

export const userStorage = storage.defineItem<User | null>("local:user", {
	fallback: null,
});

// ── Auth Tokens (session - cleared on browser restart) ──────

export const authTokensStorage = storage.defineItem<AuthTokens | null>(
	"session:authTokens",
	{
		fallback: null,
	},
);

// ── Refresh Token (persistent - survives browser restart) ───

export const refreshTokenStorage = storage.defineItem<string | null>(
	"local:refreshToken",
	{
		fallback: null,
	},
);
