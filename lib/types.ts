// ── Cell Types ──────────────────────────────────────────────

export interface BookmarkCellData {
	type: "bookmark";
	url: string;
	title: string;
	favicon?: string;
}

export interface LabelCellData {
	type: "label";
	text: string;
	emoji: string;
	color?: string;
	bgColor?: string;
}

export interface EmptyCellData {
	type: "empty";
}

export type CellData = BookmarkCellData | LabelCellData | EmptyCellData;

export interface CellPosition {
	row: number;
	col: number;
}

export interface Cell {
	id: string;
	/**
	 * Stable grid coordinate. Unlike a linear index, this does not change when
	 * the number of columns changes, so resizing the grid preserves placement.
	 */
	position: CellPosition;
	data: CellData;
	accentColor?: string;
}

// ── Settings ────────────────────────────────────────────────

export type ThemePreference = "light" | "dark" | "system";
export type OpenInPreference = "new-tab" | "current-tab";

export interface AppSettings {
	grid: {
		cols: number;
		rows: number;
	};
	theme: ThemePreference;
	openIn: OpenInPreference;
	updatedAt: number;
}

// ── Grid State ──────────────────────────────────────────────

export interface GridState {
	cells: Cell[];
	updatedAt: number;
}

// ── User / Auth ─────────────────────────────────────────────

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	provider: "google" | "github";
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

export interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
}

// ── API Types ───────────────────────────────────────────────

export interface ApiResponse<T> {
	ok: boolean;
	data?: T;
	error?: string;
}

export interface SyncResult {
	gridState: GridState;
	serverUpdatedAt: number;
}
