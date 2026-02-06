import type { Cell as CellType } from "@/lib/types";

interface DragOverlayContentProps {
	cell: CellType;
}

export function DragOverlayContent({ cell }: DragOverlayContentProps) {
	return (
		<div className="bg-black border border-white/10 shadow-2xl px-2 py-1 flex items-center gap-1.5 rounded">
			{cell.data.type === "bookmark" && (
				<>
					{cell.data.favicon && (
						<img
							src={cell.data.favicon}
							alt=""
							className="w-4 h-4 object-contain"
						/>
					)}
					<span className="text-xs text-white/80 truncate">
						{cell.data.title}
					</span>
				</>
			)}
			{cell.data.type === "label" && (
				<>
					<span className="text-base leading-none">{cell.data.emoji}</span>
					<span className="text-xs text-white/80 truncate">
						{cell.data.text}
					</span>
				</>
			)}
		</div>
	);
}
