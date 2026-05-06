import type { LabelCellData } from "@/lib/types";

interface LabelCellProps {
	data: LabelCellData;
	accentColor?: string;
	onEmojiClick?: () => void;
}

export function LabelCell({ data, accentColor, onEmojiClick }: LabelCellProps) {
	const { text, emoji } = data;

	return (
		<div className="flex items-center gap-1.5 w-full h-full px-3 overflow-hidden">
			<button
				type="button"
				className="text-xl shrink-0 leading-none hover:scale-110 transition-transform"
				onClick={(e) => {
					e.stopPropagation();
					onEmojiClick?.();
				}}
				title="Change Symbol"
			>
				{emoji}
			</button>
			<span
				className="text-sm truncate text-foreground font-semibold"
				style={{
					...(accentColor
						? {
								textDecorationLine: "underline",
								textDecorationColor: accentColor,
								textUnderlineOffset: "2px",
								textDecorationThickness: "2px",
							}
						: {}),
					textBoxTrim: "trim-both",
				}}
			>
				{text}
			</span>
		</div>
	);
}
