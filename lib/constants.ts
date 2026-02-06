// ── Grid Dimensions ─────────────────────────────────────────

export const GRID_COLS = 10;
export const GRID_ROWS = 20;
export const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

// ── Favicon ─────────────────────────────────────────────────

export const FAVICON_API_URL = "https://www.google.com/s2/favicons";

export function getFaviconUrl(url: string, size = 32): string {
	try {
		const domain = new URL(url).hostname;
		return `${FAVICON_API_URL}?domain=${domain}&sz=${size}`;
	} catch {
		return "";
	}
}

// ── API ─────────────────────────────────────────────────────

export const API_BASE_URL = "https://api.gridbookmarks.example.com";

// ── Sync ────────────────────────────────────────────────────

export const SYNC_DEBOUNCE_MS = 2000;
