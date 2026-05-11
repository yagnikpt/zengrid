import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	rectSwappingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { comparePositions } from "@/lib/grid-utils";
import type {
	CellData,
	CellPosition,
	Cell as CellType,
	OpenInPreference,
	ThemePreference,
} from "@/lib/types";
import { Cell } from "./Cell";
import { DragOverlayContent } from "./DragOverlay";

interface GridProps {
	cells: CellType[];
	cols: number;
	rows: number;
	openIn: OpenInPreference;
	theme: ThemePreference;
	colorMode: "light" | "dark";
	onSwap: (fromPosition: CellPosition, toPosition: CellPosition) => void;
	onUpdateCell: (position: CellPosition, data: CellData) => void;
	onRemoveCell: (position: CellPosition) => void;
	onRemoveCells: (positions: CellPosition[]) => void;
	onSetAccentColor: (
		position: CellPosition,
		accentColor: string | undefined,
	) => void;
}

type Point = { x: number; y: number };

export function Grid({
	cells,
	cols,
	rows,
	openIn,
	theme,
	colorMode,
	onSwap,
	onUpdateCell,
	onRemoveCell,
	onRemoveCells,
	onSetAccentColor,
}: GridProps) {
	const [activeDragCell, setActiveDragCell] = useState<CellType | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [shiftHeld, setShiftHeld] = useState(false);

	// Rubber-band state
	const gridRef = useRef<HTMLDivElement>(null);
	const rbStart = useRef<Point | null>(null);
	const [rbRect, setRbRect] = useState<{
		left: number;
		top: number;
		width: number;
		height: number;
	} | null>(null);

	// Track shift key globally
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "Shift") setShiftHeld(true);
		};
		const up = (e: KeyboardEvent) => {
			if (e.key === "Shift") setShiftHeld(false);
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, []);

	// Delete / Escape keyboard shortcuts
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setSelectedIds(new Set());
				return;
			}
			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				selectedIds.size > 0
			) {
				if ((e.target as HTMLElement).tagName === "INPUT") return;
				onRemoveCells(
					sortedCells
						.filter((c) => selectedIds.has(c.id))
						.map((c) => c.position),
				);
				setSelectedIds(new Set());
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedIds, onRemoveCells]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const sortedCells = useMemo(
		() => [...cells].sort((a, b) => comparePositions(a.position, b.position)),
		[cells],
	);
	const cellIds = useMemo(() => sortedCells.map((c) => c.id), [sortedCells]);

	// ── Rubber-band selection ─────────────────────────────────
	const computeHitIds = useCallback(
		(r: { left: number; top: number; width: number; height: number }) => {
			if (!gridRef.current) return new Set<string>();
			const result = new Set<string>();
			const els =
				gridRef.current.querySelectorAll<HTMLElement>("[data-cell-id]");
			for (const el of els) {
				const br = el.getBoundingClientRect();
				if (
					br.left < r.left + r.width &&
					br.right > r.left &&
					br.top < r.top + r.height &&
					br.bottom > r.top
				) {
					const id = el.getAttribute("data-cell-id");
					if (id) result.add(id);
				}
			}
			return result;
		},
		[],
	);

	const handleGridMouseDown = useCallback((e: React.MouseEvent) => {
		if (!e.shiftKey) return;
		e.preventDefault();
		rbStart.current = { x: e.clientX, y: e.clientY };
		setRbRect({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
	}, []);

	useEffect(() => {
		if (!rbRect && !rbStart.current) return;

		const onMove = (e: MouseEvent) => {
			if (!rbStart.current) return;
			const s = rbStart.current;
			setRbRect({
				left: Math.min(s.x, e.clientX),
				top: Math.min(s.y, e.clientY),
				width: Math.abs(e.clientX - s.x),
				height: Math.abs(e.clientY - s.y),
			});
		};

		const onUp = (e: MouseEvent) => {
			if (!rbStart.current) return;
			const s = rbStart.current;
			const dist = Math.hypot(e.clientX - s.x, e.clientY - s.y);

			if (dist < 5) {
				// Treat as click: toggle the cell under the pointer
				const el = document
					.elementFromPoint(s.x, s.y)
					?.closest("[data-cell-id]");
				const id = el?.getAttribute("data-cell-id");
				if (id) {
					setSelectedIds((prev) => {
						const next = new Set(prev);
						if (next.has(id)) next.delete(id);
						else next.add(id);
						return next;
					});
				}
			} else {
				// Rubber-band: select all intersecting cells
				const finalRect = {
					left: Math.min(s.x, e.clientX),
					top: Math.min(s.y, e.clientY),
					width: Math.abs(e.clientX - s.x),
					height: Math.abs(e.clientY - s.y),
				};
				setSelectedIds(computeHitIds(finalRect));
			}

			rbStart.current = null;
			setRbRect(null);
		};

		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onUp);
		return () => {
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseup", onUp);
		};
	}, [rbRect, computeHitIds]);

	// ── DnD ──────────────────────────────────────────────────
	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const cell = sortedCells.find((c) => c.id === event.active.id);
			if (cell && cell.data.type !== "empty") setActiveDragCell(cell);
		},
		[sortedCells],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveDragCell(null);
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const a = sortedCells.find((c) => c.id === active.id);
			const o = sortedCells.find((c) => c.id === over.id);
			if (a && o) onSwap(a.position, o.position);
		},
		[sortedCells, onSwap],
	);

	const deleteSelected = useCallback(() => {
		onRemoveCells(
			sortedCells.filter((c) => selectedIds.has(c.id)).map((c) => c.position),
		);
		setSelectedIds(new Set());
	}, [selectedIds, sortedCells, onRemoveCells]);

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={cellIds} strategy={rectSwappingStrategy}>
					<div
						ref={gridRef}
						className="grid w-full h-full gap-px bg-border/60"
						style={{
							gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
							gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
						}}
						onMouseDown={handleGridMouseDown}
					>
						{sortedCells.map((cell) => (
							<Cell
								key={cell.id}
								cell={cell}
								openIn={openIn}
								isSelected={selectedIds.has(cell.id)}
								shiftHeld={shiftHeld}
								onUpdateCell={onUpdateCell}
								onRemoveCell={onRemoveCell}
								onSetAccentColor={onSetAccentColor}
								theme={theme}
								colorMode={colorMode}
							/>
						))}
					</div>
				</SortableContext>

				<DragOverlay dropAnimation={null}>
					{activeDragCell ? <DragOverlayContent cell={activeDragCell} /> : null}
				</DragOverlay>
			</DndContext>

			{/* Rubber-band overlay */}
			{rbRect && rbRect.width > 2 && (
				<div
					className="fixed pointer-events-none z-50 border-2 border-primary bg-primary/10 rounded"
					style={{
						left: rbRect.left,
						top: rbRect.top,
						width: rbRect.width,
						height: rbRect.height,
					}}
				/>
			)}

			{/* Selection toolbar */}
			{selectedIds.size > 0 && (
				<div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-popover border border-border shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150">
					<span className="text-sm text-muted-foreground">
						{selectedIds.size} selected
					</span>
					<div className="w-px h-4 bg-border" />
					<button
						type="button"
						onClick={deleteSelected}
						className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
					>
						<Trash2 size={14} /> Delete
					</button>
					<div className="w-px h-4 bg-border" />
					<button
						type="button"
						onClick={() => setSelectedIds(new Set())}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X size={14} />
					</button>
				</div>
			)}
		</>
	);
}
