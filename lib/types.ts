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

export interface Cell {
	id: string;
	position: number;
	data: CellData;
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
