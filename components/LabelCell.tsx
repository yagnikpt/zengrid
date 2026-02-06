import type { LabelCellData } from "@/lib/types";

interface LabelCellProps {
	data: LabelCellData;
	onEmojiClick?: () => void;
}

export function LabelCell({ data, onEmojiClick }: LabelCellProps) {
	const { text, emoji } = data;

	return (
		<div className="flex items-center gap-1.5 w-full h-full px-1.5 overflow-hidden">
			<button
				type="button"
				className="text-base shrink-0 leading-none hover:scale-110 transition-transform"
				onClick={(e) => {
					e.stopPropagation();
					onEmojiClick?.();
				}}
				title="Change emoji"
			>
				{emoji}
			</button>
			<span className="text-xs leading-none text-white/70 truncate">
				{text}
			</span>
		</div>
	);
}
