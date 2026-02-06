import { TOTAL_CELLS } from "./constants";
import type { Cell, CellData, GridState } from "./types";

// ── Random Emoji ────────────────────────────────────────────

const EMOJI_POOL = [
	"🔖",
	"📌",
	"📎",
	"🗂️",
	"📁",
	"📂",
	"📝",
	"✏️",
	"🖊️",
	"📋",
	"⭐",
	"💡",
	"🔗",
	"🏷️",
	"📑",
	"🗒️",
	"🔔",
	"💎",
	"🎯",
	"🚀",
	"🌟",
	"🎨",
	"🧩",
	"🔥",
	"💫",
	"🌈",
	"🍀",
	"🎲",
	"🧠",
	"💻",
	"☕",
	"🎵",
	"📚",
	"🌍",
	"🏠",
	"🛠️",
	"🎁",
	"🪴",
	"🐾",
	"🦋",
];

export function getRandomEmoji(): string {
	return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
}

// ── Cell ID ─────────────────────────────────────────────────
export function generateCellId(): string {
	return crypto.randomUUID();
}

/**
 * Create an empty cell at a given position
 */
export function createEmptyCell(position: number): Cell {
	return {
		id: generateCellId(),
		position,
		data: { type: "empty" },
	};
}

/**
 * Create a full empty grid with TOTAL_CELLS cells
 */
export function createEmptyGrid(): GridState {
	const cells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) =>
		createEmptyCell(i),
	);
	return {
		cells,
		updatedAt: Date.now(),
	};
}

/**
 * Swap two cells' positions in the grid
 */
export function swapCells(
	cells: Cell[],
	fromIndex: number,
	toIndex: number,
): Cell[] {
	const newCells = [...cells];
	const fromCell = { ...newCells[fromIndex], position: toIndex };
	const toCell = { ...newCells[toIndex], position: fromIndex };
	newCells[fromIndex] = toCell;
	newCells[toIndex] = fromCell;
	return newCells;
}

/**
 * Update a cell's data at a given position
 */
export function updateCellData(
	cells: Cell[],
	position: number,
	data: CellData,
): Cell[] {
	return cells.map((cell) =>
		cell.position === position ? { ...cell, data } : cell,
	);
}

/**
 * Clear a cell (make it empty) at a given position
 */
export function clearCell(cells: Cell[], position: number): Cell[] {
	return updateCellData(cells, position, { type: "empty" });
}

/**
 * Check if a string looks like a URL.
 * Accepts both full URLs (https://…) and bare domains (example.com).
 */
export function isValidUrl(str: string): boolean {
	const trimmed = str.trim();
	// Full URL with protocol
	try {
		const url = new URL(trimmed);
		if (url.protocol === "http:" || url.protocol === "https:") return true;
	} catch {
		// not a full URL, try bare domain check below
	}
	// Bare domain pattern: word.tld or word.word.tld (no spaces)
	return /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed);
}

/**
 * Normalize a user input string into a proper URL.
 * Adds https:// if missing.
 */
export function normalizeUrl(str: string): string {
	const trimmed = str.trim();
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

/**
 * Extract a title from a URL (domain name, cleaned up)
 */
export function titleFromUrl(url: string): string {
	try {
		const hostname = new URL(url).hostname;
		// Remove www. prefix and .com/.org/etc suffix for cleaner display
		return hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

/**
 * Fetch the actual page title from a URL.
 * Delegates to the background service worker to avoid CORS issues.
 * Returns null if the title can't be fetched.
 */
export async function fetchPageTitle(url: string): Promise<string | null> {
	try {
		const response = await browser.runtime.sendMessage({
			type: "FETCH_PAGE_TITLE",
			url,
		});
		return response?.title ?? null;
	} catch {
		return null;
	}
}
