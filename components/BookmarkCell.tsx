import { getFaviconUrl } from "@/lib/constants";
import type { BookmarkCellData } from "@/lib/types";

interface BookmarkCellProps {
	data: BookmarkCellData;
	accentColor?: string;
}

export function BookmarkCell({ data }: BookmarkCellProps) {
	const { url, title, favicon } = data;
	const faviconSrc = favicon || getFaviconUrl(url);

	return (
		<div className="flex items-center gap-3 w-full h-full px-3 overflow-hidden">
			<div className="size-5 shrink-0 flex items-center justify-center">
				{faviconSrc ? (
					<img
						src={faviconSrc}
						alt={title}
						className="size-5 rounded object-contain"
						loading="lazy"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
							const parent = (e.target as HTMLImageElement).parentElement;
							if (parent) {
								parent.textContent = title.charAt(0).toUpperCase();
								parent.className =
									"size-5 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground";
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
				className="text-sm truncate text-foreground max-w-full"
				style={{
					textBoxTrim: "trim-both",
				}}
			>
				{title}
			</span>
		</div>
	);
}
