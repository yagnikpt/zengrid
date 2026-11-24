import { getFaviconUrl } from "@/lib/constants";
import type { BookmarkCellData, GridStylePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BookmarkCellProps {
	data: BookmarkCellData;
	accentColor?: string;
	style?: GridStylePreference;
}

export function BookmarkCell({
	data,
	style = "classic",
}: BookmarkCellProps) {
	const { url, title, favicon, faviconBackdrop } = data;
	const faviconSrc = favicon || getFaviconUrl(url);

	return (
		<div
			className={cn(
				"flex items-center w-full h-full overflow-hidden",
				style === "cards" && "gap-2.5 px-3",
				style === "paper" && "gap-2.5 px-3 font-serif",
				style === "terminal" && "gap-2 px-3 font-mono text-xs",
				style === "classic" && "gap-3 px-3",
			)}
		>
			{style === "terminal" && (
				<span className="text-emerald-500/80 font-mono text-xs select-none shrink-0">
					›
				</span>
			)}

			<div className="size-4.5 shrink-0 flex items-center justify-center">
				{faviconSrc ? (
					<img
						src={faviconSrc}
						alt={title}
						className={cn(
							"size-4.5 rounded object-contain",
							faviconBackdrop && "dark:bg-foreground dark:p-px dark:rounded-sm",
						)}
						loading="lazy"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
							const parent = (e.target as HTMLImageElement).parentElement;
							if (parent) {
								parent.textContent = title.charAt(0).toUpperCase();
								parent.className =
									"size-4.5 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground";
							}
						}}
					/>
				) : (
					<span className="text-[10px] font-bold text-muted-foreground">
						{title.charAt(0).toUpperCase()}
					</span>
				)}
			</div>
			<span
				className={cn(
					"truncate text-foreground max-w-full",
					style === "cards" && "text-xs font-normal text-foreground/90",
					style === "paper" && "text-sm font-normal text-foreground/90 font-serif",
					style === "terminal" && "text-xs text-emerald-300 font-mono",
					style === "classic" && "text-sm",
				)}
				style={{
					textBoxTrim: "trim-both",
				}}
			>
				{title}
			</span>
		</div>
	);
}
