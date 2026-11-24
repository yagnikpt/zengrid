import type { GridStylePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EmptyCellProps {
	style?: GridStylePreference;
}

export function EmptyCell({ style = "classic" }: EmptyCellProps) {
	if (style === "cards") {
		return (
			<div className="w-full h-full rounded-lg border border-transparent transition-all" />
		);
	}

	if (style === "paper") {
		return <div className="w-full h-full" />;
	}

	if (style === "terminal") {
		return <div className="w-full h-full" />;
	}

	return <div className="w-full h-full" />;
}
