import type { GridStylePreference, LabelCellData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LabelCellProps {
	data: LabelCellData;
	accentColor?: string;
	defaultColColor?: string;
	onEmojiClick?: () => void;
	style?: GridStylePreference;
}

export function LabelCell({
	data,
	accentColor,
	defaultColColor,
	onEmojiClick,
	style = "classic",
}: LabelCellProps) {
	const { text, emoji } = data;
	const dotColor = accentColor || defaultColColor || "#38bdf8";

	// ── Cards style: colored bullet dot + clean title ─────────
	if (style === "cards") {
		return (
			<div className="flex items-center gap-2 w-full h-full px-2.5 overflow-hidden select-none">
				<span
					className="size-2 rounded-full shrink-0 shadow-2xs"
					style={{ backgroundColor: dotColor }}
				/>
				<span className="text-sm font-semibold truncate text-foreground tracking-tight">
					{text}
				</span>
			</div>
		);
	}

	// ── Paper style: serif italic with highlighter marker ──────
	if (style === "paper") {
		return (
			<div className="flex items-center w-full h-full px-2.5 overflow-hidden select-none">
				<span
					className={cn(
						"font-serif italic font-bold text-sm tracking-wide px-2 py-0.5 rounded-xs inline-block truncate",
						"transition-all",
					)}
					style={{
						backgroundColor: accentColor
							? `${accentColor}38`
							: defaultColColor
								? `${defaultColColor}38`
								: "rgba(56, 189, 248, 0.3)",
						color: "var(--foreground)",
					}}
				>
					{text}
				</span>
			</div>
		);
	}

	// ── Terminal style: monospace prompt # label ───────────────
	if (style === "terminal") {
		return (
			<div className="flex items-center gap-1.5 w-full h-full px-2.5 overflow-hidden font-mono select-none">
				<span
					className="font-bold text-sm"
					style={{ color: dotColor }}
				>
					#
				</span>
				<span className="text-sm font-semibold truncate text-emerald-300 font-mono">
					{text.toLowerCase()}
				</span>
			</div>
		);
	}

	// ── Classic style (default): emoji button + underlined title
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
