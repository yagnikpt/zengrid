import type { Cell as CellType, GridStylePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DragOverlayContentProps {
	cell: CellType;
	style?: GridStylePreference;
}

export function DragOverlayContent({
	cell,
	style = "classic",
}: DragOverlayContentProps) {
	return (
		<div
			className={cn(
				"bg-popover text-popover-foreground border border-border shadow-2xl px-3 py-1.5 flex items-center gap-2 rounded-lg",
				style === "cards" && "rounded-lg shadow-xl dark:bg-[#1c1f24] dark:border-white/10",
				style === "paper" && "font-serif bg-[#fbf9f4] dark:bg-[#252320]",
				style === "terminal" && "font-mono bg-[#090c10] border-emerald-500/50 text-emerald-400",
			)}
		>
			{cell.data.type === "bookmark" && (
				<>
					{cell.data.favicon && (
						<img
							src={cell.data.favicon}
							alt=""
							className="size-4 object-contain rounded"
						/>
					)}
					<span className="text-xs text-popover-foreground/90 font-medium truncate">
						{cell.data.title}
					</span>
				</>
			)}
			{cell.data.type === "label" && (
				<>
					{style === "cards" ? (
						<span
							className="size-2 rounded-full shrink-0"
							style={{ backgroundColor: cell.accentColor || "#38bdf8" }}
						/>
					) : (
						<span className="text-base leading-none">{cell.data.emoji}</span>
					)}
					<span className="text-xs font-semibold text-popover-foreground/90 truncate">
						{cell.data.text}
					</span>
				</>
			)}
		</div>
	);
}
