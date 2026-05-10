import { storage } from "wxt/utils/storage";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "./constants";
import { createEmptyGrid } from "./grid-utils";
import type { AppSettings, AuthTokens, GridState, User } from "./types";

// ── Grid State (persistent local cache) ─────────────────────

export const gridStateStorage = storage.defineItem<GridState>(
	"local:gridState",
	{
		fallback: createEmptyGrid(),
	},
);

// ── Settings (persistent local cache) ───────────────────────

export const DEFAULT_APP_SETTINGS: AppSettings = {
	grid: {
		cols: DEFAULT_GRID_COLS,
		rows: DEFAULT_GRID_ROWS,
	},
	colorMode: "system",
	theme: "classic",
	openIn: "new-tab",
	updatedAt: Date.now(),
};

export const settingsStorage = storage.defineItem<AppSettings>(
	"local:settings",
	{
		fallback: DEFAULT_APP_SETTINGS,
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
