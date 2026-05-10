// ── Grid Settings ───────────────────────────────────────────

export const DEFAULT_GRID_COLS = 10;
export const DEFAULT_GRID_ROWS = 20;
export const MIN_GRID_COLS = 1;
export const MAX_GRID_COLS = 30;
export const MIN_GRID_ROWS = 1;
export const MAX_GRID_ROWS = 50;

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

// ── Sync ────────────────────────────────────────────────────

export const SYNC_DEBOUNCE_MS = 2000;
