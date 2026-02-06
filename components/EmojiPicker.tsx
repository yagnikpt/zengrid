import { useEffect, useRef } from "react";
import {
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPicker as EmojiPickerRoot,
	EmojiPickerSearch,
} from "@/components/ui/emoji-picker";

interface EmojiPickerProps {
	onSelect: (emoji: string) => void;
	onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	// Close on Escape
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div
			ref={containerRef}
			role="dialog"
			className="absolute left-0 top-full z-100 mt-1 rounded-lg border border-white/10 bg-black shadow-2xl"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<EmojiPickerRoot
				className="h-85.5"
				onEmojiSelect={({ emoji }: { emoji: string }) => onSelect(emoji)}
			>
				<EmojiPickerSearch placeholder="Search emoji..." />
				<EmojiPickerContent />
				<EmojiPickerFooter />
			</EmojiPickerRoot>
		</div>
	);
}
