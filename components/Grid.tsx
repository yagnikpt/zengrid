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
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useMemo, useState } from "react";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import type { CellData, Cell as CellType } from "@/lib/types";
import { Cell } from "./Cell";
import { DragOverlayContent } from "./DragOverlay";

interface GridProps {
	cells: CellType[];
	onSwap: (fromPosition: number, toPosition: number) => void;
	onUpdateCell: (position: number, data: CellData) => void;
	onRemoveCell: (position: number) => void;
}

export function Grid({ cells, onSwap, onUpdateCell, onRemoveCell }: GridProps) {
	const [activeDragCell, setActiveDragCell] = useState<CellType | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const sortedCells = useMemo(
		() => [...cells].sort((a, b) => a.position - b.position),
		[cells],
	);

	const cellIds = useMemo(() => sortedCells.map((c) => c.id), [sortedCells]);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const cell = sortedCells.find((c) => c.id === event.active.id);
			if (cell && cell.data.type !== "empty") {
				setActiveDragCell(cell);
			}
		},
		[sortedCells],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveDragCell(null);
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const activeCell = sortedCells.find((c) => c.id === active.id);
			const overCell = sortedCells.find((c) => c.id === over.id);

			if (activeCell && overCell) {
				onSwap(activeCell.position, overCell.position);
			}
		},
		[sortedCells, onSwap],
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={cellIds} strategy={rectSortingStrategy}>
				<div
					className="grid w-full h-full"
					style={{
						gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
						gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
					}}
				>
					{sortedCells.map((cell) => (
						<Cell
							key={cell.id}
							cell={cell}
							onUpdateCell={onUpdateCell}
							onRemoveCell={onRemoveCell}
						/>
					))}
				</div>
			</SortableContext>

			<DragOverlay dropAnimation={null}>
				{activeDragCell ? <DragOverlayContent cell={activeDragCell} /> : null}
			</DragOverlay>
		</DndContext>
	);
}
