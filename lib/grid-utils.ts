import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "./constants";
import type { Cell, CellData, CellPosition, GridState } from "./types";

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

export function makePosition(row: number, col: number): CellPosition {
	return { row, col };
}

export function getPositionKey(position: CellPosition): string {
	return `${position.row}:${position.col}`;
}

export function isSamePosition(a: CellPosition, b: CellPosition): boolean {
	return a.row === b.row && a.col === b.col;
}

export function comparePositions(a: CellPosition, b: CellPosition): number {
	return a.row - b.row || a.col - b.col;
}

export function isPositionVisible(
	position: CellPosition,
	cols: number,
	rows: number,
): boolean {
	return (
		position.row >= 0 &&
		position.row < rows &&
		position.col >= 0 &&
		position.col < cols
	);
}

/**
 * Convert legacy linear indexes to stable row/column coordinates.
 */
export function normalizePosition(
	position: Cell["position"] | number,
): CellPosition {
	if (typeof position === "number") {
		return {
			row: Math.floor(position / DEFAULT_GRID_COLS),
			col: position % DEFAULT_GRID_COLS,
		};
	}

	return position;
}

/**
 * Create an empty cell at a given row/column coordinate.
 */
export function createEmptyCell(position: CellPosition): Cell {
	return {
		id: generateCellId(),
		position,
		data: { type: "empty" },
	};
}

export function createGridCells(cols: number, rows: number): Cell[] {
	return Array.from({ length: cols * rows }, (_, i) =>
		createEmptyCell(makePosition(Math.floor(i / cols), i % cols)),
	);
}

/**
 * Create a full empty grid.
 */
export function createEmptyGrid(
	cols = DEFAULT_GRID_COLS,
	rows = DEFAULT_GRID_ROWS,
): GridState {
	return {
		cells: createGridCells(cols, rows),
		updatedAt: Date.now(),
	};
}

/**
 * Normalize legacy cells and make sure the visible grid has exactly one cell
 * for every coordinate. Non-empty cells outside the current dimensions are kept
 * so shrinking and later expanding the grid does not destroy user data.
 */
export function normalizeCells(
	cells: Cell[],
	cols: number,
	rows: number,
): Cell[] {
	const byPosition = new Map<string, Cell>();

	for (const cell of cells) {
		const position = normalizePosition(cell.position);
		const normalizedCell = { ...cell, position };
		const key = getPositionKey(position);
		const existing = byPosition.get(key);

		if (!existing || existing.data.type === "empty") {
			byPosition.set(key, normalizedCell);
		}
	}

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			const position = makePosition(row, col);
			const key = getPositionKey(position);
			if (!byPosition.has(key)) {
				byPosition.set(key, createEmptyCell(position));
			}
		}
	}

	return [...byPosition.values()].sort((a, b) =>
		comparePositions(a.position, b.position),
	);
}

export function getVisibleCells(
	cells: Cell[],
	cols: number,
	rows: number,
): Cell[] {
	return normalizeCells(cells, cols, rows).filter((cell) =>
		isPositionVisible(cell.position, cols, rows),
	);
}

/**
 * Swap two cells' positions in the grid.
 */
export function swapCells(
	cells: Cell[],
	fromPosition: CellPosition,
	toPosition: CellPosition,
): Cell[] {
	return cells.map((cell) => {
		if (isSamePosition(cell.position, fromPosition)) {
			return { ...cell, position: toPosition };
		}

		if (isSamePosition(cell.position, toPosition)) {
			return { ...cell, position: fromPosition };
		}

		return cell;
	});
}

/**
 * Update a cell's data at a given position.
 */
export function updateCellData(
	cells: Cell[],
	position: CellPosition,
	data: CellData,
): Cell[] {
	let didUpdate = false;
	const updatedCells = cells.map((cell) => {
		if (!isSamePosition(cell.position, position)) return cell;
		didUpdate = true;
		return { ...cell, data };
	});

	return didUpdate
		? updatedCells
		: [...updatedCells, { ...createEmptyCell(position), data }];
}

/**
 * Clear a cell (make it empty) at a given position, removing accent color.
 */
export function clearCell(cells: Cell[], position: CellPosition): Cell[] {
	return cells.map((cell) =>
		isSamePosition(cell.position, position)
			? { ...cell, data: { type: "empty" }, accentColor: undefined }
			: cell,
	);
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
