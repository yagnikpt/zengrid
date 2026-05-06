import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, Palette, Pencil, Trash2, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ACCENT_COLORS, getFaviconUrl } from "@/lib/constants";
import {
	fetchPageTitle,
	getRandomEmoji,
	isValidUrl,
	normalizeUrl,
} from "@/lib/grid-utils";
import type { CellData, CellPosition, Cell as CellType, OpenInPreference } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookmarkCell } from "./BookmarkCell";
import { EmojiPicker } from "./EmojiPicker";
import { EmptyCell } from "./EmptyCell";
import { LabelCell } from "./LabelCell";

interface CellProps {
	cell: CellType;
	openIn: OpenInPreference;
	isSelected: boolean;
	shiftHeld: boolean;
	onUpdateCell: (position: CellPosition, data: CellData) => void;
	onRemoveCell: (position: CellPosition) => void;
	onSetAccentColor: (
		position: CellPosition,
		accentColor: string | undefined,
	) => void;
}

export function Cell({
	cell,
	openIn,
	isSelected,
	shiftHeld,
	onUpdateCell,
	onRemoveCell,
	onSetAccentColor,
}: CellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [pendingEmoji, setPendingEmoji] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	// When true, we're editing a bookmark's display title (not creating a new cell)
	const editingBookmarkTitle = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const cellRef = useRef<HTMLDivElement>(null);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: cell.id,
		data: { position: cell.position, cell },
		disabled: isEditing || showEmojiPicker,
	});

	// Merge refs
	const mergedRef = useCallback(
		(node: HTMLButtonElement | null) => {
			setNodeRef(node);
			(cellRef as React.RefObject<HTMLButtonElement | null>).current = node;
		},
		[setNodeRef],
	);

	// Focus input when entering edit mode
	useEffect(() => {
		if (isEditing) {
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [isEditing]);

	// Start editing text only (for labels: prefill text, keep emoji separate)
	const startEditing = useCallback((prefill = "", emoji?: string) => {
		setInputValue(prefill);
		setPendingEmoji(emoji ?? getRandomEmoji());
		setIsEditing(true);
	}, []);

	// Process input on Enter
	const handleSubmit = useCallback(async () => {
		const value = inputValue.trim();
		if (!value) {
			setIsEditing(false);
			editingBookmarkTitle.current = false;
			return;
		}

		// If we're editing an existing bookmark's title, just update the title
		if (editingBookmarkTitle.current && cell.data.type === "bookmark") {
			onUpdateCell(cell.position, {
				...cell.data,
				title: value,
			});
			setIsEditing(false);
			setInputValue("");
			editingBookmarkTitle.current = false;
			return;
		}

		if (isValidUrl(value)) {
			const url = normalizeUrl(value);
			// Set immediately with domain fallback, then fetch real title
			const fallbackTitle = new URL(url).hostname.replace(/^www\./, "");
			onUpdateCell(cell.position, {
				type: "bookmark",
				url,
				title: fallbackTitle,
				favicon: getFaviconUrl(url),
			});

			// Fetch real page title in the background
			fetchPageTitle(url).then((title) => {
				if (title && title !== fallbackTitle) {
					onUpdateCell(cell.position, {
						type: "bookmark",
						url,
						title,
						favicon: getFaviconUrl(url),
					});
				}
			});
		} else {
			onUpdateCell(cell.position, {
				type: "label",
				text: value,
				emoji: pendingEmoji,
			});
		}

		setIsEditing(false);
		setInputValue("");
		editingBookmarkTitle.current = false;
	}, [inputValue, pendingEmoji, cell.position, cell.data, onUpdateCell]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleSubmit();
			} else if (e.key === "Escape") {
				e.preventDefault();
				setIsEditing(false);
				setInputValue("");
			}
		},
		[handleSubmit],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			if (showEmojiPicker) return; // Don't close if emoji picker is open
			if (inputValue.trim()) {
				handleSubmit();
			} else {
				setIsEditing(false);
			}
		}, 150);
	}, [inputValue, handleSubmit, showEmojiPicker]);

	// Handle external drag-and-drop
	const handleDragOver = useCallback((e: React.DragEvent) => {
		if (
			e.dataTransfer.types.includes("text/uri-list") ||
			e.dataTransfer.types.includes("text/plain")
		) {
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const uri = e.dataTransfer.getData("text/uri-list");
			const text = e.dataTransfer.getData("text/plain");
			const droppedValue = uri || text;
			if (!droppedValue) return;

			if (isValidUrl(droppedValue)) {
				const url = normalizeUrl(droppedValue);
				const fallbackTitle = new URL(url).hostname.replace(/^www\./, "");
				onUpdateCell(cell.position, {
					type: "bookmark",
					url,
					title: fallbackTitle,
					favicon: getFaviconUrl(url),
				});
				fetchPageTitle(url).then((title) => {
					if (title && title !== fallbackTitle) {
						onUpdateCell(cell.position, {
							type: "bookmark",
							url,
							title,
							favicon: getFaviconUrl(url),
						});
					}
				});
			} else {
				onUpdateCell(cell.position, {
					type: "label",
					text: droppedValue,
					emoji: getRandomEmoji(),
				});
			}
		},
		[cell.position, onUpdateCell],
	);

	// Click handler
	const handleClick = useCallback((e: React.MouseEvent) => {
		// Shift is handled by Grid's rubber-band, don't open/edit
		if (e.shiftKey) { e.preventDefault(); return; }
		if (isEditing || showEmojiPicker) return;

		switch (cell.data.type) {
			case "empty":
				startEditing();
				break;
			case "label":
				startEditing(cell.data.text, cell.data.emoji);
				break;
			case "bookmark":
				if (openIn === "current-tab") {
					window.open(cell.data.url, "_self");
				} else {
					window.open(cell.data.url, "_blank", "noopener");
				}
				break;
		}
	}, [cell.data, isEditing, showEmojiPicker, startEditing, openIn]);

	// Emoji selected from picker (for label cells or new cells)
	const handleEmojiSelect = useCallback(
		(emoji: string) => {
			setShowEmojiPicker(false);
			if (cell.data.type === "label" && !isEditing) {
				// Directly update existing label's emoji
				onUpdateCell(cell.position, { ...cell.data, emoji });
			} else {
				// During editing (new cell), update pending emoji
				setPendingEmoji(emoji);
				requestAnimationFrame(() => inputRef.current?.focus());
			}
		},
		[cell.data, cell.position, onUpdateCell, isEditing],
	);

	// Emoji button click on a rendered LabelCell
	const handleLabelEmojiClick = useCallback(() => {
		setShowEmojiPicker(true);
	}, []);

	// Context menu actions
	const handleEdit = useCallback(() => {
		if (cell.data.type === "bookmark") {
			// Edit the bookmark's display title
			editingBookmarkTitle.current = true;
			startEditing(cell.data.title);
		} else if (cell.data.type === "label") {
			// Edit label text only, keep the emoji
			startEditing(cell.data.text, cell.data.emoji);
		}
	}, [cell.data, startEditing]);

	const handleOpenInNewTab = useCallback(() => {
		if (cell.data.type === "bookmark") {
			window.open(cell.data.url, "_blank", "noopener");
		}
	}, [cell.data]);

	const handleDelete = useCallback(() => {
		onRemoveCell(cell.position);
	}, [cell.position, onRemoveCell]);

	// Resolve accent color config for this cell
	const accentConfig = cell.accentColor
		? ACCENT_COLORS.find((c) => c.accent === cell.accentColor)
		: undefined;

	// ── Render ──────────────────────────────────────────────

	const cellStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		...(accentConfig && cell.data.type !== "empty"
			? { backgroundColor: accentConfig.bg }
			: {}),
	};

	const cellContent = (
		<button
			data-cell-id={cell.data.type !== "empty" ? cell.id : undefined}
			ref={mergedRef}
			style={cellStyle}
			{...attributes}
			{...(cell.data.type !== "empty" && !isEditing && !showEmojiPicker && !shiftHeld
				? listeners
				: {})}
			tabIndex={0}
			className={cn(
				"relative select-none overflow-visible",
				"border-r border-b border-border/60",
				"transition-colors duration-100",
				!isEditing && "cursor-pointer hover:bg-foreground/4",
				isDragging && "z-50 bg-foreground/8",
				isSelected && "ring-2 ring-inset ring-primary bg-primary/10",
			)}
			onClick={handleClick}
	
			onKeyDown={(e) => {
				if (!isEditing && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					handleClick(e as unknown as React.MouseEvent);
				}
			}}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{isEditing ? (
				<div
					className={cn(
						"flex items-center w-full h-full px-3",
						cell.data.type === "bookmark" ? "gap-3" : "gap-1.5",
					)}
				>
					{editingBookmarkTitle.current && cell.data.type === "bookmark" ? (
						<div className="size-5 shrink-0 flex items-center justify-center">
							<img
								src={cell.data.favicon || getFaviconUrl(cell.data.url)}
								alt={cell.data.title}
								className="size-5 object-contain rounded"
							/>
						</div>
					) : (
						<button
							type="button"
							className="text-xl shrink-0 leading-none hover:scale-110 transition-transform"
							onClick={(e) => {
								e.stopPropagation();
								setShowEmojiPicker((v) => !v);
							}}
							title="Change emoji"
						>
							{pendingEmoji}
						</button>
					)}
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						placeholder="url or text"
						className={cn(
							"w-full h-full bg-transparent text-sm text-foreground/90 placeholder-muted-foreground/50 outline-none",
							cell.data.type === "label" && "font-semibold",
						)}
						onClick={(e) => e.stopPropagation()}
					/>
					{showEmojiPicker && (
						<EmojiPicker
							onSelect={handleEmojiSelect}
							onClose={() => {
								setShowEmojiPicker(false);
								requestAnimationFrame(() => inputRef.current?.focus());
							}}
						/>
					)}
				</div>
			) : (
				<>
					{cell.data.type === "bookmark" && (
						<BookmarkCell data={cell.data} accentColor={cell.accentColor} />
					)}
					{cell.data.type === "label" && (
						<LabelCell
							data={cell.data}
							accentColor={cell.accentColor}
							onEmojiClick={handleLabelEmojiClick}
						/>
					)}
					{cell.data.type === "empty" && <EmptyCell />}
					{/* Emoji picker for non-editing label cells (emoji button click) */}
					{showEmojiPicker && cell.data.type === "label" && (
						<EmojiPicker
							onSelect={handleEmojiSelect}
							onClose={() => setShowEmojiPicker(false)}
						/>
					)}
				</>
			)}
		</button>
	);

	// Empty cells don't need a context menu
	if (cell.data.type === "empty" || isEditing) {
		return cellContent;
	}

	// Wrap non-empty cells with context menu
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{cellContent}</ContextMenuTrigger>
			<ContextMenuContent className="w-44">
				{cell.data.type === "bookmark" && (
					<>
						<ContextMenuItem onClick={handleOpenInNewTab}>
							<ExternalLink className="mr-2 h-3.5 w-3.5" />
							Open in new tab
						</ContextMenuItem>
						<ContextMenuItem onClick={handleEdit}>
							<Pencil className="mr-2 h-3.5 w-3.5" />
							Edit label
						</ContextMenuItem>
					</>
				)}
				{cell.data.type === "label" && (
					<ContextMenuItem onClick={handleEdit}>
						<Pencil className="mr-2 h-3.5 w-3.5" />
						Edit label
					</ContextMenuItem>
				)}
				<ContextMenuSub>
					<ContextMenuSubTrigger>
						<Palette className="mr-2 h-3.5 w-3.5" />
						Accent color
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="min-w-35">
						{ACCENT_COLORS.map((color) => (
							<ContextMenuItem
								key={color.accent}
								onClick={() => onSetAccentColor(cell.position, color.accent)}
							>
								<span
									className="mr-2 inline-block h-3 w-3 rounded-full shrink-0"
									style={{ backgroundColor: color.accent }}
								/>
								{color.name}
								{cell.accentColor === color.accent && (
									<span className="ml-auto text-muted-foreground">
										&#10003;
									</span>
								)}
							</ContextMenuItem>
						))}
						{cell.accentColor && (
							<>
								<ContextMenuSeparator />
								<ContextMenuItem
									onClick={() => onSetAccentColor(cell.position, undefined)}
								>
									<X className="mr-2 h-3.5 w-3.5" />
									Remove
								</ContextMenuItem>
							</>
						)}
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive" onClick={handleDelete}>
					<Trash2 className="mr-2 h-3.5 w-3.5" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
