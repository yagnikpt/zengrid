import { createClient } from "@supabase/supabase-js";
import { refreshAccessToken } from "../auth/oauth";
import { authTokensStorage, DEFAULT_APP_SETTINGS } from "../storage";
import type {
	AppSettings,
	Cell,
	ColorModePreference,
	GridState,
	OpenInPreference,
	ThemePreference,
} from "../types";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.WXT_SUPABASE_PUBLISHABLE_KEY;

type UserSettingsRow = {
	grid_cols: number;
	grid_rows: number;
	color_mode: ColorModePreference;
	theme: ThemePreference;
	open_in: OpenInPreference;
	updated_at: string;
};

function isThemePreference(value: unknown): value is ThemePreference {
	return (
		value === "classic" ||
		value === "gruvbox" ||
		value === "catppuccin" ||
		value === "github" ||
		value === "tokyonight" ||
		value === "rosepine" ||
		value === "kanagawa"
	);
}

type GridCellRow = {
	id: string;
	row: number;
	col: number;
	cell_type: "bookmark" | "label" | "empty";
	url: string | null;
	title: string | null;
	favicon: string | null;
	label_text: string | null;
	emoji: string | null;
	accent_color: string | null;
	metadata: Record<string, unknown> | null;
	updated_at: string;
};

async function getAccessToken(): Promise<string> {
	let tokens = await authTokensStorage.getValue();
	if (!tokens) return "";

	if (tokens.expiresAt <= Date.now()) {
		const refreshed = await refreshAccessToken();
		if (!refreshed) return "";
		tokens = await authTokensStorage.getValue();
		if (!tokens) return "";
	}

	return tokens.accessToken;
}

const dbClient =
	supabaseUrl && supabasePublishableKey
		? createClient(supabaseUrl, supabasePublishableKey, {
				accessToken: getAccessToken,
				auth: {
					persistSession: false,
					autoRefreshToken: false,
					detectSessionInUrl: false,
					storageKey: "grid-bookmarks-db-client",
				},
			})
		: null;

function toCellRows(userId: string, cells: Cell[]) {
	return cells
		.map((cell) => {
			const base = {
				user_id: userId,
				row: cell.position.row,
				col: cell.position.col,
				accent_color: cell.accentColor ?? null,
			};

			if (cell.data.type === "empty") return null;

			if (cell.data.type === "bookmark") {
				return {
					...base,
					cell_type: "bookmark",
					url: cell.data.url,
					title: cell.data.title,
					favicon: cell.data.favicon ?? null,
					label_text: null,
					emoji: null,
					metadata: {
						faviconBackdrop: cell.data.faviconBackdrop ?? false,
					},
				};
			}

			return {
				...base,
				cell_type: "label",
				url: null,
				title: null,
				favicon: null,
				label_text: cell.data.text,
				emoji: cell.data.emoji,
				metadata: {
					color: cell.data.color ?? null,
					bgColor: cell.data.bgColor ?? null,
				},
			};
		})
		.filter((row) => row !== null);
}

function fromCellRows(rows: GridCellRow[]): Cell[] {
	return rows
		.map((row) => {
			if (row.cell_type === "bookmark") {
				if (!row.url || !row.title) return null;
				const metadata = row.metadata ?? {};
				return {
					id: row.id,
					position: { row: row.row, col: row.col },
					accentColor: row.accent_color ?? undefined,
					data: {
						type: "bookmark" as const,
						url: row.url,
						title: row.title,
						favicon: row.favicon ?? undefined,
						faviconBackdrop: metadata.faviconBackdrop === true,
					},
				};
			}

			if (row.cell_type === "label") {
				if (!row.label_text || !row.emoji) return null;
				const metadata = row.metadata ?? {};
				return {
					id: row.id,
					position: { row: row.row, col: row.col },
					accentColor: row.accent_color ?? undefined,
					data: {
						type: "label" as const,
						text: row.label_text,
						emoji: row.emoji,
						color:
							typeof metadata.color === "string" ? metadata.color : undefined,
						bgColor:
							typeof metadata.bgColor === "string"
								? metadata.bgColor
								: undefined,
					},
				};
			}

			return null;
		})
		.filter((cell) => cell !== null);
}

async function getAuthedClient() {
	if (!dbClient) {
		return { client: null, error: "Missing Supabase env variables" };
	}

	const accessToken = await getAccessToken();
	if (!accessToken) {
		return { client: null, error: "Not authenticated" };
	}

	return { client: dbClient, error: null };
}

// ── Discriminated load result ───────────────────────────────
export type RemoteLoadResult =
	| { status: "ok"; data: { gridState: GridState; settings: AppSettings } }
	| { status: "empty" }
	| { status: "error"; error: string; retriable: boolean };

export async function loadRemoteGridState(
	userId: string,
): Promise<RemoteLoadResult> {
	const { client, error } = await getAuthedClient();
	if (!client) {
		// "Not authenticated" is transient (token refresh in-flight).
		// Everything else is a hard config error.
		return {
			status: "error",
			error: error ?? "No Supabase client",
			retriable: error === "Not authenticated",
		};
	}

	const [
		{ data: settingsRow, error: settingsError },
		{ data: cellRows, error: cellsError },
	] = await Promise.all([
		client
			.from("user_settings")
			.select("grid_cols, grid_rows, color_mode, theme, open_in, updated_at")
			.eq("user_id", userId)
			.maybeSingle<UserSettingsRow>(),
		client
			.from("grid_cells")
			.select(
				"id, row, col, cell_type, url, title, favicon, label_text, emoji, accent_color, metadata, updated_at",
			)
			.eq("user_id", userId)
			.order("row", { ascending: true })
			.order("col", { ascending: true })
			.returns<GridCellRow[]>(),
	]);

	if (settingsError) {
		console.error(
			"[sync] Failed loading user_settings:",
			settingsError.message,
		);
		return { status: "error", error: settingsError.message, retriable: true };
	}
	if (cellsError) {
		console.error("[sync] Failed loading grid_cells:", cellsError.message);
		return { status: "error", error: cellsError.message, retriable: true };
	}

	// No remote data at all — user has never synced.
	if (!settingsRow && (!cellRows || cellRows.length === 0)) {
		return { status: "empty" };
	}

	const settings: AppSettings = {
		grid: {
			cols: settingsRow?.grid_cols ?? DEFAULT_APP_SETTINGS.grid.cols,
			rows: settingsRow?.grid_rows ?? DEFAULT_APP_SETTINGS.grid.rows,
		},
		colorMode: settingsRow?.color_mode ?? DEFAULT_APP_SETTINGS.colorMode,
		theme: isThemePreference(settingsRow?.theme)
			? settingsRow.theme
			: DEFAULT_APP_SETTINGS.theme,
		openIn: settingsRow?.open_in ?? DEFAULT_APP_SETTINGS.openIn,
		updatedAt: settingsRow?.updated_at
			? Date.parse(settingsRow.updated_at)
			: DEFAULT_APP_SETTINGS.updatedAt,
	};

	const cells = fromCellRows(cellRows ?? []);
	const cellsUpdatedAt = (cellRows ?? []).reduce((maxTs, row) => {
		const ts = row.updated_at ? Date.parse(row.updated_at) : 0;
		return Math.max(maxTs, ts);
	}, 0);

	return {
		status: "ok",
		data: {
			gridState: {
				cells,
				updatedAt: cellsUpdatedAt,
			},
			settings,
		},
	};
}

export async function saveRemoteGridState(
	userId: string,
	gridState: GridState,
	settings: AppSettings,
): Promise<{ ok: boolean; error?: string }> {
	const { client, error } = await getAuthedClient();
	if (!client) {
		return { ok: false, error: error ?? "No Supabase client" };
	}

	const { error: settingsError } = await client.from("user_settings").upsert(
		{
			user_id: userId,
			grid_cols: settings.grid.cols,
			grid_rows: settings.grid.rows,
			color_mode: settings.colorMode,
			theme: settings.theme,
			open_in: settings.openIn,
		},
		{ onConflict: "user_id" },
	);
	if (settingsError) {
		return { ok: false, error: settingsError.message };
	}

	const rows = toCellRows(userId, gridState.cells);

	// Safety: if no non-empty cells exist locally, only clear remote cells
	// that are outside the current grid bounds (never wipe everything).
	if (rows.length === 0) {
		const { error: pruneError } = await client
			.from("grid_cells")
			.delete()
			.eq("user_id", userId)
			.or(`row.gte.${settings.grid.rows},col.gte.${settings.grid.cols}`);
		if (pruneError) {
			return { ok: false, error: pruneError.message };
		}
		return { ok: true };
	}

	// Upsert current cells (using row+col+user_id as the conflict key)
	const upsertRows = rows.map((r) => ({
		...r,
		updated_at: new Date().toISOString(),
	}));
	const { error: upsertError } = await client
		.from("grid_cells")
		.upsert(upsertRows, { onConflict: "user_id, row, col" });
	if (upsertError) {
		return { ok: false, error: upsertError.message };
	}

	// Remove cells that are no longer occupied (positions not in the local state)
	const occupiedPositions = new Set(rows.map((r) => `${r.row},${r.col}`));
	const { data: remoteCells } = await client
		.from("grid_cells")
		.select("id, row, col")
		.eq("user_id", userId);

	if (remoteCells) {
		const staleIds = remoteCells
			.filter((rc) => !occupiedPositions.has(`${rc.row},${rc.col}`))
			.map((rc) => rc.id);

		if (staleIds.length > 0) {
			const { error: deleteError } = await client
				.from("grid_cells")
				.delete()
				.in("id", staleIds);
			if (deleteError) {
				return { ok: false, error: deleteError.message };
			}
		}
	}

	return { ok: true };
}
