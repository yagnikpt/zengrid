import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { THEMES } from "@/lib/themes";
import type {
	ColorModePreference,
	GridStylePreference,
	ThemePreference,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface AppearanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	style: GridStylePreference;
	onStyleChange: (style: GridStylePreference) => void;
	colorMode: ColorModePreference;
	onColorModeChange: (colorMode: ColorModePreference) => void;
	theme: ThemePreference;
	onThemeChange: (theme: ThemePreference) => void;
}

export function AppearanceModal({
	isOpen,
	onClose,
	style,
	onStyleChange,
	colorMode,
	onColorModeChange,
	theme,
	onThemeChange,
}: AppearanceModalProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on click outside and Esc key
	useEffect(() => {
		if (!isOpen) return;

		const onPointerDown = (e: PointerEvent) => {
			const path = e.composedPath();
			const clickedInside = path.some(
				(node) => node instanceof Node && !!containerRef.current?.contains(node),
			);
			if (clickedInside) return;

			// Don't close if clicking trigger buttons in dock (their onClick will handle toggling)
			const clickedTrigger = path.some(
				(node) =>
					node instanceof Element &&
					(node.closest('[aria-label="Appearance settings"]') !== null ||
						node.closest('[aria-label="Grid settings"]') !== null),
			);
			if (clickedTrigger) return;

			// Radix Select portal clicks
			const clickedInsideSelectPortal = path.some(
				(node) =>
					node instanceof Element &&
					(node.matches('[data-slot="select-content"]') ||
						node.closest('[data-slot="select-content"]') !== null),
			);
			if (clickedInsideSelectPortal) return;

			onClose();
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};

		document.addEventListener("pointerdown", onPointerDown, { capture: true });
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, { capture: true });
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			ref={containerRef}
			role="dialog"
			aria-modal="true"
			aria-labelledby="appearance-modal-title"
			className={cn(
				"fixed bottom-16 right-4 z-50 w-[360px] rounded-2xl border border-border/80 bg-popover/95 p-4 text-popover-foreground shadow-2xl backdrop-blur-md",
				"origin-bottom-right duration-150 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between pb-3">
				<h2 id="appearance-modal-title" className="text-base font-semibold text-foreground">Appearance</h2>
				<button
					type="button"
					onClick={onClose}
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					title="Close"
					aria-label="Close appearance modal"
				>
					<X className="size-4" />
				</button>
			</div>

			{/* Style section */}
			<div className="space-y-2">
				<div className="text-xs font-medium text-muted-foreground">Style</div>
				<div className="grid grid-cols-4 gap-2.5">
					<StyleOptionCard
						id="classic"
						name="Classic"
						isSelected={style === "classic"}
						onClick={() => onStyleChange("classic")}
					>
						<ClassicThumbnail />
					</StyleOptionCard>

					<StyleOptionCard
						id="cards"
						name="Cards"
						isSelected={style === "cards"}
						onClick={() => onStyleChange("cards")}
					>
						<CardsThumbnail />
					</StyleOptionCard>

					<StyleOptionCard
						id="paper"
						name="Paper"
						isSelected={style === "paper"}
						onClick={() => onStyleChange("paper")}
					>
						<PaperThumbnail />
					</StyleOptionCard>

					<StyleOptionCard
						id="terminal"
						name="Terminal"
						isSelected={style === "terminal"}
						onClick={() => onStyleChange("terminal")}
					>
						<TerminalThumbnail />
					</StyleOptionCard>
				</div>
			</div>

			<div className="my-3 border-t border-border/60" />

			{/* Color mode & theme */}
			<div className="space-y-3">
				<div>
					<div className="mb-1.5 text-xs font-medium text-muted-foreground">
						Color mode
					</div>
					<div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-1">
						{(["light", "dark", "system"] as const).map((option) => (
							<button
								type="button"
								key={option}
								onClick={() => onColorModeChange(option)}
								className={`rounded px-2 py-1 text-[11px] capitalize transition-colors ${
									colorMode === option
										? "bg-muted font-medium text-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
								}`}
							>
								{option}
							</button>
						))}
					</div>
				</div>

				<div>
					<div className="mb-1.5 text-xs font-medium text-muted-foreground">
						Theme
					</div>
					<Select
						value={theme}
						onValueChange={(value) => onThemeChange(value as ThemePreference)}
					>
						<SelectTrigger className="w-full bg-background text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{THEMES.map((option) => (
								<SelectItem key={option.id} value={option.id}>
									{option.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

interface StyleOptionCardProps {
	id: string;
	name: string;
	isSelected: boolean;
	onClick: () => void;
	children: ReactNode;
}

function StyleOptionCard({
	name,
	isSelected,
	onClick,
	children,
}: StyleOptionCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex flex-col items-center gap-1.5 focus:outline-none"
		>
			<div
				className={cn(
					"relative h-20 w-full rounded-xl overflow-hidden border transition-all cursor-pointer",
					isSelected
						? "ring-2 ring-foreground border-transparent shadow-md"
						: "border-border/60 hover:border-border hover:shadow-xs",
				)}
			>
				{children}
			</div>
			<span
				className={cn(
					"text-xs transition-colors",
					isSelected
						? "font-semibold text-foreground"
						: "font-medium text-muted-foreground group-hover:text-foreground",
				)}
			>
				{name}
			</span>
		</button>
	);
}

/**
 * Thumbnail preview for "Classic" style:
 * Displays a 2-column table grid with Dev / Design headers and cell rows.
 */
function ClassicThumbnail() {
	return (
		<div className="h-full w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col p-1">
			{/* Headers */}
			<div className="grid grid-cols-2 gap-px border-b border-slate-300 dark:border-slate-700 pb-0.5">
				<div className="bg-sky-100 dark:bg-sky-950/80 px-1 py-0.5 border-b border-sky-500">
					<div className="text-[8px] font-bold text-sky-900 dark:text-sky-300 leading-none">
						Dev
					</div>
				</div>
				<div className="bg-emerald-100 dark:bg-emerald-950/80 px-1 py-0.5 border-b border-emerald-500">
					<div className="text-[8px] font-bold text-emerald-900 dark:text-emerald-300 leading-none">
						Desig
					</div>
				</div>
			</div>
			{/* Rows */}
			<div className="grid grid-cols-2 gap-px pt-1">
				<div className="flex items-center gap-1 p-0.5 border-r border-slate-200 dark:border-slate-800">
					<div className="size-2.5 rounded-xs bg-slate-900 dark:bg-slate-100 shrink-0" />
					<div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
				</div>
				<div className="flex items-center gap-1 p-0.5">
					<div className="size-2.5 rounded-xs bg-slate-900 dark:bg-slate-100 shrink-0" />
					<div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-px pt-1">
				<div className="flex items-center gap-1 p-0.5 border-r border-slate-200 dark:border-slate-800">
					<div className="size-2.5 rounded-xs bg-slate-900 dark:bg-slate-100 shrink-0" />
					<div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
				</div>
				<div className="flex items-center gap-1 p-0.5">
					<div className="size-2.5 rounded-xs bg-slate-900 dark:bg-slate-100 shrink-0" />
					<div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
				</div>
			</div>
		</div>
	);
}

/**
 * Thumbnail preview for "Cards" style:
 * Displays dot + Dev / dot + Des headers with floating rounded cards underneath.
 */
function CardsThumbnail() {
	return (
		<div className="h-full w-full bg-[#202328] dark:bg-[#191c21] p-1.5 flex flex-col gap-1.5">
			{/* Headers */}
			<div className="grid grid-cols-2 gap-1.5">
				<div className="flex items-center gap-1">
					<span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
					<span className="text-[8px] font-semibold text-slate-200 leading-none">
						Dev
					</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
					<span className="text-[8px] font-semibold text-slate-200 leading-none">
						Des
					</span>
				</div>
			</div>
			{/* Cards */}
			<div className="grid grid-cols-2 gap-1.5">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-1 rounded bg-[#2b3038] p-1 border border-white/5">
						<div className="size-2 rounded-xs bg-[#111317] shrink-0" />
						<div className="h-1.5 w-full rounded-full bg-slate-400/60" />
					</div>
					<div className="flex items-center gap-1 rounded bg-[#2b3038] p-1 border border-white/5">
						<div className="size-2 rounded-xs bg-[#111317] shrink-0" />
						<div className="h-1.5 w-full rounded-full bg-slate-400/60" />
					</div>
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-1 rounded bg-[#2b3038] p-1 border border-white/5">
						<div className="size-2 rounded-xs bg-[#111317] shrink-0" />
						<div className="h-1.5 w-full rounded-full bg-slate-400/60" />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Thumbnail preview for "Paper" style:
 * Lined notebook paper with red vertical margin line and serif italic highlighter headers.
 */
function PaperThumbnail() {
	return (
		<div className="relative h-full w-full bg-[#f4efe5] dark:bg-[#252320] p-1.5 flex flex-col justify-between overflow-hidden">
			{/* Red margin line */}
			<div className="absolute top-0 bottom-0 left-[22px] w-[1px] bg-red-400/80 dark:bg-red-500/70 pointer-events-none" />

			{/* Horizontal ruled lines */}
			<div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-40">
				<div className="h-px w-full bg-blue-300 dark:bg-blue-800" />
				<div className="h-px w-full bg-blue-300 dark:bg-blue-800" />
				<div className="h-px w-full bg-blue-300 dark:bg-blue-800" />
			</div>

			{/* Headers */}
			<div className="relative z-10 grid grid-cols-2 gap-1 pt-0.5">
				<div>
					<span className="font-serif italic font-bold text-[8px] bg-sky-300/80 dark:bg-sky-700/80 text-sky-950 dark:text-sky-100 px-1 py-0.2 rounded-xs">
						Dev
					</span>
				</div>
				<div>
					<span className="font-serif italic font-bold text-[8px] bg-amber-300/90 dark:bg-amber-700/80 text-amber-950 dark:text-amber-100 px-1 py-0.2 rounded-xs">
						Design
					</span>
				</div>
			</div>

			{/* Rows */}
			<div className="relative z-10 grid grid-cols-2 gap-1">
				<div className="flex items-center gap-1 py-0.5">
					<div className="size-2 rounded-xs bg-slate-800 dark:bg-slate-300 shrink-0" />
					<div className="h-1 w-full bg-slate-400/80 dark:bg-slate-600 rounded-full" />
				</div>
				<div className="flex items-center gap-1 py-0.5">
					<div className="size-2 rounded-xs bg-slate-800 dark:bg-slate-300 shrink-0" />
					<div className="h-1 w-full bg-slate-400/80 dark:bg-slate-600 rounded-full" />
				</div>
			</div>

			<div className="relative z-10 grid grid-cols-2 gap-1">
				<div className="flex items-center gap-1 py-0.5">
					<div className="size-2 rounded-xs bg-slate-800 dark:bg-slate-300 shrink-0" />
					<div className="h-1 w-full bg-slate-400/80 dark:bg-slate-600 rounded-full" />
				</div>
				<div className="flex items-center gap-1 py-0.5">
					<div className="size-2 rounded-xs bg-slate-800 dark:bg-slate-300 shrink-0" />
					<div className="h-1 w-full bg-slate-400/80 dark:bg-slate-600 rounded-full" />
				</div>
			</div>
		</div>
	);
}

/**
 * Thumbnail preview for "Terminal" style:
 * Dark terminal with dashed grid, # dev, # design, and > prompts.
 */
function TerminalThumbnail() {
	return (
		<div className="relative h-full w-full bg-[#0a0d12] p-1.5 flex flex-col font-mono text-[7px] text-emerald-400 justify-between">
			{/* Headers */}
			<div className="grid grid-cols-2 gap-1 border-b border-dashed border-emerald-900/60 pb-0.5">
				<span className="text-cyan-400 font-semibold truncate"># dev</span>
				<span className="text-emerald-400 font-semibold truncate"># desi</span>
			</div>
			{/* Content */}
			<div className="grid grid-cols-2 gap-1 text-[6.5px] text-slate-300">
				<span className="truncate">› gitl</span>
				<span className="truncate">› fign</span>
			</div>
			<div className="grid grid-cols-2 gap-1 text-[6.5px] text-slate-300">
				<span className="truncate">› verc</span>
				<span className="truncate opacity-40">_</span>
			</div>
		</div>
	);
}
