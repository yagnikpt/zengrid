import { useState, useEffect, useCallback } from "react";
import { gridStateStorage } from "../storage";
import { mockApi } from "../api/mock";
import {
	createEmptyGrid,
	swapCells,
	updateCellData,
	clearCell,
} from "../grid-utils";
import { SYNC_DEBOUNCE_MS } from "../constants";
import type { Cell, CellData, GridState } from "../types";

/**
 * Hook that manages the grid state with cache-first loading and background sync.
 *
 * 1. Loads from local storage immediately (cached data).
 * 2. Fetches from API in background, merges if newer.
 * 3. Debounced save to API on changes.
 */
export function useGrid() {
	const [gridState, setGridState] = useState<GridState | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncError, setSyncError] = useState<string | null>(null);

	// ── Load from cache on mount ────────────────────────────
	useEffect(() => {
		let cancelled = false;

		async function loadGrid() {
			let cached: GridState | null = null;

			// 1. Load from local cache first (instant paint)
			try {
				cached = await gridStateStorage.getValue();
			} catch (err) {
				console.warn(
					"Failed to load grid from storage, using empty grid:",
					err,
				);
			}

			if (!cancelled) {
				// Always set a grid state, even if storage failed
				setGridState(cached ?? createEmptyGrid());
				setIsLoading(false);
			}

			// 2. Fetch from API in background
			try {
				const result = await mockApi.getGrid();
				if (!cancelled && result.ok && result.data) {
					// Use server data if it's newer than cache
					if (!cached || result.data.updatedAt > cached.updatedAt) {
						setGridState(result.data);
						try {
							await gridStateStorage.setValue(result.data);
						} catch {
							// Storage write failed - non-critical
						}
					}
				}
			} catch {
				// Silently fail on background sync - cache is still valid
			}
		}

		loadGrid();
		return () => {
			cancelled = true;
		};
	}, []);

	// ── Debounced save to API ───────────────────────────────
	useEffect(() => {
		if (!gridState) return;

		const timer = setTimeout(async () => {
			setIsSyncing(true);
			setSyncError(null);

			try {
				await gridStateStorage.setValue(gridState);

				const result = await mockApi.saveGrid(gridState);
				if (!result.ok) {
					setSyncError(result.error ?? "Sync failed");
				}
			} catch (err) {
				setSyncError(err instanceof Error ? err.message : "Sync failed");
			} finally {
				setIsSyncing(false);
			}
		}, SYNC_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [gridState]);

	// ── Actions ─────────────────────────────────────────────

	const swap = useCallback((fromPosition: number, toPosition: number) => {
		setGridState((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				cells: swapCells(prev.cells, fromPosition, toPosition),
				updatedAt: Date.now(),
			};
		});
	}, []);

	const updateCell = useCallback((position: number, data: CellData) => {
		setGridState((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				cells: updateCellData(prev.cells, position, data),
				updatedAt: Date.now(),
			};
		});
	}, []);

	const removeCell = useCallback((position: number) => {
		setGridState((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				cells: clearCell(prev.cells, position),
				updatedAt: Date.now(),
			};
		});
	}, []);

	return {
		cells: gridState?.cells ?? [],
		isLoading,
		isSyncing,
		syncError,
		swap,
		updateCell,
		removeCell,
	};
}
