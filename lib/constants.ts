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

// ── Accent Colors ───────────────────────────────────────────

export interface AccentColor {
	name: string;
	/** The accent color used for underlines and color swatches */
	accent: string;
	/** A very low-opacity version for cell backgrounds (visible on black) */
	bg: string;
}

export const ACCENT_COLORS: AccentColor[] = [
	{ name: "Rose", accent: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)" },
	{ name: "Orange", accent: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
	{ name: "Amber", accent: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
	{ name: "Emerald", accent: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
	{ name: "Sky", accent: "#0ea5e9", bg: "rgba(14, 165, 233, 0.12)" },
	{ name: "Violet", accent: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" },
	{ name: "Pink", accent: "#ec4899", bg: "rgba(236, 72, 153, 0.12)" },
];
