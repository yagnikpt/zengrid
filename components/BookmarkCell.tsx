import { getFaviconUrl } from "@/lib/constants";
import type { BookmarkCellData } from "@/lib/types";

interface BookmarkCellProps {
	data: BookmarkCellData;
}

export function BookmarkCell({ data }: BookmarkCellProps) {
	const { url, title, favicon } = data;
	const faviconSrc = favicon || getFaviconUrl(url);

	return (
		<div className="flex items-center gap-1.5 w-full h-full px-1.5 overflow-hidden">
			<div className="w-4 h-4 shrink-0 flex items-center justify-center">
				{faviconSrc ? (
					<img
						src={faviconSrc}
						alt=""
						className="w-4 h-4 object-contain"
						loading="lazy"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
							const parent = (e.target as HTMLImageElement).parentElement;
							if (parent) {
								parent.textContent = title.charAt(0).toUpperCase();
								parent.className =
									"w-4 h-4 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white/40";
							}
						}}
					/>
				) : (
					<span className="text-[10px] font-bold text-white/40">
						{title.charAt(0).toUpperCase()}
					</span>
				)}
			</div>
			<span className="text-xs leading-none text-white/70 truncate">
				{title}
			</span>
		</div>
	);
}
