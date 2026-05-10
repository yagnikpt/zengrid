import { useCallback, useEffect, useRef, useState } from "react";
import {
	MAX_GRID_COLS,
	MAX_GRID_ROWS,
	MIN_GRID_COLS,
	MIN_GRID_ROWS,
	SYNC_DEBOUNCE_MS,
} from "../constants";
import {
	clearCell,
	createEmptyGrid,
	getVisibleCells,
	normalizeCells,
	swapCells,
	updateCellData,
} from "../grid-utils";
import {
	DEFAULT_APP_SETTINGS,
	gridStateStorage,
	settingsStorage,
	userStorage,
} from "../storage";
import { loadRemoteGridState, saveRemoteGridState } from "../supabase/sync";
import type {
	AppSettings,
	CellData,
	CellPosition,
	ColorModePreference,
	GridState,
	OpenInPreference,
	ThemePreference,
	User,
} from "../types";

/**
 * Hook that manages the grid state with persistent local storage.
 *
 * 1. Loads from local storage immediately (cached data).
 * 2. Reconciles with remote once auth is ready.
 * 3. Debounced save back to storage + remote on every change.
 */
function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(Math.max(Math.trunc(value), min), max);
}

function isColorModePreference(value: unknown): value is ColorModePreference {
	return value === "light" || value === "dark" || value === "system";
}

function isThemePreference(value: unknown): value is ThemePreference {
	return value === "classic" || value === "gruvbox";
}

function isOpenInPreference(value: unknown): value is OpenInPreference {
	return value === "new-tab" || value === "current-tab";
}

function normalizeSettings(
	settings: AppSettings | null | undefined,
): AppSettings {
	const rawSettings = settings as
		| (AppSettings & {
				theme?: unknown;
				colorMode?: unknown;
		  })
		| null
		| undefined;

	return {
		...DEFAULT_APP_SETTINGS,
		...settings,
		grid: {
			cols: clamp(
				settings?.grid?.cols ?? DEFAULT_APP_SETTINGS.grid.cols,
				MIN_GRID_COLS,
				MAX_GRID_COLS,
			),
			rows: clamp(
				settings?.grid?.rows ?? DEFAULT_APP_SETTINGS.grid.rows,
				MIN_GRID_ROWS,
				MAX_GRID_ROWS,
			),
		},
		colorMode: isColorModePreference(rawSettings?.colorMode)
			? rawSettings.colorMode
			: isColorModePreference(rawSettings?.theme)
				? rawSettings.theme
				: DEFAULT_APP_SETTINGS.colorMode,
		theme: isThemePreference(rawSettings?.theme)
			? rawSettings.theme
			: DEFAULT_APP_SETTINGS.theme,
		openIn: isOpenInPreference(settings?.openIn)
			? settings.openIn
			: DEFAULT_APP_SETTINGS.openIn,
	};
}

export function useGrid() {
	const [gridState, setGridState] = useState<GridState | null>(null);
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncError, setSyncError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	// Track whether the initial load has completed to avoid saving the
	// fallback empty grid back to storage before the real data is loaded.
	const initialLoadDone = useRef(false);
	const syncedUserIdRef = useRef<string | null>(null);

	// Timestamp of the last successful reconciliation or remote save.
	// The debounced save only pushes to remote if local state is newer.
	const lastRemoteSyncAtRef = useRef(0);

	// ── Load from cache on mount ────────────────────────────
	useEffect(() => {
		let cancelled = false;

		async function loadGrid() {
			let cachedGrid: GridState | null = null;
			let cachedSettings: AppSettings | null = null;

			try {
				[cachedGrid, cachedSettings] = await Promise.all([
					gridStateStorage.getValue(),
					settingsStorage.getValue(),
				]);
			} catch (err) {
				console.warn("Failed to load grid from storage, using defaults:", err);
			}

			if (!cancelled) {
				const nextSettings = normalizeSettings(cachedSettings);
				const nextGrid =
					cachedGrid ??
					createEmptyGrid(nextSettings.grid.cols, nextSettings.grid.rows);

				setSettings(nextSettings);
				setGridState({
					...nextGrid,
					cells: normalizeCells(
						nextGrid.cells,
						nextSettings.grid.cols,
						nextSettings.grid.rows,
					),
				});
				setIsLoading(false);
				initialLoadDone.current = true;
			}
		}

		loadGrid();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadUser() {
			const cachedUser = await userStorage.getValue();
			if (!cancelled) setUser(cachedUser);
		}

		loadUser();
		const unwatch = userStorage.watch((nextUser: User | null) => {
			if (!cancelled) {
				setUser(nextUser);
				if (!nextUser) {
					syncedUserIdRef.current = null;
				}
			}
		});

		return () => {
			cancelled = true;
			unwatch();
		};
	}, []);

	// ── Initial remote reconciliation after auth ────────────
	// Uses refs to read current state, so the effect only re-runs
	// when auth changes — never when grid/settings change.
	const gridStateRef = useRef(gridState);
	gridStateRef.current = gridState;
	const settingsRef = useRef(settings);
	settingsRef.current = settings;

	useEffect(() => {
		if (isLoading || !initialLoadDone.current || !user) return;

		const currentUser = user;
		if (syncedUserIdRef.current === currentUser.id) return;

		let cancelled = false;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;

		async function reconcileRemote() {
			setIsSyncing(true);
			setSyncError(null);

			try {
				const result = await loadRemoteGridState(currentUser.id);
				if (cancelled) return;

				if (result.status === "error") {
					if (result.retriable) {
						// Auth isn't ready yet — retry after a short delay.
						console.info("[sync] Auth not ready, retrying reconciliation in 2s…");
						retryTimer = setTimeout(() => {
							if (!cancelled) reconcileRemote();
						}, 2000);
					} else {
						setSyncError(result.error);
					}
					return;
				}

				if (result.status === "empty") {
					// No remote data — push local state to seed remote.
					const localGrid = gridStateRef.current;
					const localSettings = settingsRef.current;
					if (!localGrid || !localSettings) return;

					const pushed = await saveRemoteGridState(
						currentUser.id,
						localGrid,
						localSettings,
					);
					if (cancelled) return;
					if (!pushed.ok) {
						setSyncError(pushed.error ?? "Failed to initialize remote sync");
						return;
					}
					syncedUserIdRef.current = currentUser.id;
					lastRemoteSyncAtRef.current = Date.now();
					return;
				}

				// result.status === "ok" — remote data exists, pull it.
				const remote = result.data;
				const nextSettings = normalizeSettings(remote.settings);
				const nextGrid: GridState = {
					...remote.gridState,
					cells: normalizeCells(
						remote.gridState?.cells ?? [],
						nextSettings.grid.cols,
						nextSettings.grid.rows,
					),
				};

				// Persist to local storage immediately so a crash/close
				// before the next debounced save doesn't lose the remote data.
				await Promise.all([
					gridStateStorage.setValue(nextGrid),
					settingsStorage.setValue(nextSettings),
				]);

				if (cancelled) return;

				// Update React state. Set the timestamp BEFORE the setState
				// calls so the debounced-save effect sees it and skips the
				// redundant push back to remote.
				lastRemoteSyncAtRef.current = Date.now();
				syncedUserIdRef.current = currentUser.id;
				setSettings(nextSettings);
				setGridState(nextGrid);
			} catch (err) {
				if (!cancelled) {
					setSyncError(
						err instanceof Error ? err.message : "Failed to sync with Supabase",
					);
				}
			} finally {
				if (!cancelled) setIsSyncing(false);
			}
		}

		reconcileRemote();

		return () => {
			cancelled = true;
			if (retryTimer) clearTimeout(retryTimer);
		};
	}, [user, isLoading]);

	// ── Debounced save to local + remote ────────────────────
	useEffect(() => {
		if (!gridState || !settings || !initialLoadDone.current) return;

		const timer = setTimeout(async () => {
			setIsSyncing(true);
			setSyncError(null);

			try {
				await Promise.all([
					gridStateStorage.setValue(gridState),
					settingsStorage.setValue(settings),
				]);

				if (user && syncedUserIdRef.current === user.id) {
					// Only push if local state is newer than the last remote sync.
					// This avoids pushing back the remote state we just pulled
					// during reconciliation.
					const localTs = Math.max(
						gridState.updatedAt ?? 0,
						settings.updatedAt ?? 0,
					);
					if (localTs > lastRemoteSyncAtRef.current) {
						const result = await saveRemoteGridState(user.id, gridState, settings);
						if (result.ok) {
							lastRemoteSyncAtRef.current = Date.now();
						} else {
							setSyncError(result.error ?? "Failed to sync to Supabase");
						}
					}
				}
			} catch (err) {
				setSyncError(err instanceof Error ? err.message : "Failed to save");
			} finally {
				setIsSyncing(false);
			}
		}, SYNC_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [gridState, settings, user]);

	// ── Actions ─────────────────────────────────────────────

	const swap = useCallback(
		(fromPosition: CellPosition, toPosition: CellPosition) => {
			setGridState((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					cells: swapCells(prev.cells, fromPosition, toPosition),
					updatedAt: Date.now(),
				};
			});
		},
		[],
	);

	const updateCell = useCallback((position: CellPosition, data: CellData) => {
		setGridState((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				cells: updateCellData(prev.cells, position, data),
				updatedAt: Date.now(),
			};
		});
	}, []);

	const removeCell = useCallback((position: CellPosition) => {
		setGridState((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				cells: clearCell(prev.cells, position),
				updatedAt: Date.now(),
			};
		});
	}, []);

	const removeCells = useCallback((positions: CellPosition[]) => {
		setGridState((prev) => {
			if (!prev) return prev;
			let cells = prev.cells;
			for (const pos of positions) {
				cells = clearCell(cells, pos);
			}
			return { ...prev, cells, updatedAt: Date.now() };
		});
	}, []);

	const setAccentColor = useCallback(
		(position: CellPosition, accentColor: string | undefined) => {
			setGridState((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					cells: prev.cells.map((cell) =>
						cell.position.row === position.row &&
						cell.position.col === position.col
							? { ...cell, accentColor }
							: cell,
					),
					updatedAt: Date.now(),
				};
			});
		},
		[],
	);

	const updateGridDimensions = useCallback((cols: number, rows: number) => {
		const nextCols = clamp(cols, MIN_GRID_COLS, MAX_GRID_COLS);
		const nextRows = clamp(rows, MIN_GRID_ROWS, MAX_GRID_ROWS);

		setSettings((prev) => ({
			...(prev ?? DEFAULT_APP_SETTINGS),
			grid: { cols: nextCols, rows: nextRows },
			updatedAt: Date.now(),
		}));
		setGridState((prev) => {
			const nextGrid = prev ?? createEmptyGrid(nextCols, nextRows);
			return {
				...nextGrid,
				cells: normalizeCells(nextGrid.cells, nextCols, nextRows),
				updatedAt: Date.now(),
			};
		});
	}, []);

	const updateColorMode = useCallback((colorMode: ColorModePreference) => {
		setSettings((prev) => ({
			...(prev ?? DEFAULT_APP_SETTINGS),
			colorMode,
			updatedAt: Date.now(),
		}));
	}, []);

	const updateTheme = useCallback((theme: ThemePreference) => {
		setSettings((prev) => ({
			...(prev ?? DEFAULT_APP_SETTINGS),
			theme,
			updatedAt: Date.now(),
		}));
	}, []);

	const updateOpenIn = useCallback((openIn: OpenInPreference) => {
		setSettings((prev) => ({
			...(prev ?? DEFAULT_APP_SETTINGS),
			openIn,
			updatedAt: Date.now(),
		}));
	}, []);

	const visibleCells =
		gridState && settings
			? getVisibleCells(gridState.cells, settings.grid.cols, settings.grid.rows)
			: [];

	return {
		cells: visibleCells,
		settings: settings ?? DEFAULT_APP_SETTINGS,
		isLoading,
		isSyncing,
		syncError,
		swap,
		updateCell,
		removeCell,
		removeCells,
		setAccentColor,
		updateGridDimensions,
		updateColorMode,
		updateTheme,
		updateOpenIn,
	};
}
