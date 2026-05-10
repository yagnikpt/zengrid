import { CloudOff, Loader2, LogOut, Settings } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	MAX_GRID_COLS,
	MAX_GRID_ROWS,
	MIN_GRID_COLS,
	MIN_GRID_ROWS,
} from "@/lib/constants";
import { THEMES } from "@/lib/themes";
import type {
	AppSettings,
	ColorModePreference,
	OpenInPreference,
	ThemePreference,
	User,
} from "@/lib/types";

interface SettingsMenuProps {
	user: User | null;
	isAuthenticated: boolean;
	isSyncing: boolean;
	syncError: string | null;
	settings: AppSettings;
	onGridDimensionsChange: (cols: number, rows: number) => void;
	onColorModeChange: (colorMode: ColorModePreference) => void;
	onThemeChange: (theme: ThemePreference) => void;
	onOpenInChange: (openIn: OpenInPreference) => void;
	onLogout: () => void;
	onSignIn: () => void;
}

interface SyncStatusProps {
	isSyncing: boolean;
	syncError: string | null;
}

interface GridSettingsProps {
	cols: number;
	rows: number;
	onChange: (cols: number, rows: number) => void;
}

interface ColorModeSettingsProps {
	colorMode: ColorModePreference;
	onChange: (colorMode: ColorModePreference) => void;
}

interface ThemeSettingsProps {
	theme: ThemePreference;
	onChange: (theme: ThemePreference) => void;
}

interface OpenInSettingsProps {
	openIn: OpenInPreference;
	onChange: (openIn: OpenInPreference) => void;
}

interface AccountSettingsProps {
	user: User | null;
	onLogout: () => void;
	onSignIn: () => void;
}

export function SettingsMenu({
	user,
	isAuthenticated,
	isSyncing,
	syncError,
	settings,
	onGridDimensionsChange,
	onColorModeChange,
	onThemeChange,
	onOpenInChange,
	onLogout,
	onSignIn,
}: SettingsMenuProps) {
	const [panelState, setPanelState] = useState<"open" | "closing" | "closed">(
		"closed",
	);
	const containerRef = useRef<HTMLDivElement>(null);

	const open = () => setPanelState("open");

	const close = () => {
		setPanelState("closing");
		setTimeout(() => setPanelState("closed"), 150);
	};

	const toggle = () => (panelState === "open" ? close() : open());
	const isOpen = panelState === "open";

	// Close on click outside
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: PointerEvent) => {
			const path = e.composedPath();
			const clickedInsideSettings = path.some(
				(node) =>
					node instanceof Node && !!containerRef.current?.contains(node),
			);
			if (clickedInsideSettings) return;

			// Radix Select renders in a portal. Use the full composed path so
			// text-node clicks inside portal content are also recognized.
			const clickedInsideSelectPortal = path.some(
				(node) =>
					node instanceof Element &&
					(node.matches('[data-slot="select-content"]') ||
						node.closest('[data-slot="select-content"]') !== null),
			);
			if (clickedInsideSelectPortal) return;

			close();
		};
		document.addEventListener("pointerdown", handler, { capture: true });
		return () =>
			document.removeEventListener("pointerdown", handler, { capture: true });
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
		>
			{panelState !== "closed" && (
				<SettingsPanel state={panelState}>
					{isAuthenticated && (
						<SettingsSection compact>
							<SyncStatus isSyncing={isSyncing} syncError={syncError} />
						</SettingsSection>
					)}

					<SettingsSection>
						<GridSettings
							cols={settings.grid.cols}
							rows={settings.grid.rows}
							onChange={onGridDimensionsChange}
						/>
						<ColorModeSettings
							colorMode={settings.colorMode}
							onChange={onColorModeChange}
						/>
						<ThemeSettings theme={settings.theme} onChange={onThemeChange} />
						<OpenInSettings
							openIn={settings.openIn}
							onChange={onOpenInChange}
						/>
					</SettingsSection>

					<SettingsSection compact isLast>
						<AccountSettings
							user={user}
							onLogout={() => {
								onLogout();
								close();
							}}
							onSignIn={() => {
								onSignIn();
								close();
							}}
						/>
					</SettingsSection>
				</SettingsPanel>
			)}

			<button
				type="button"
				onClick={toggle}
				className="h-9 w-9 flex items-center justify-center rounded-full border border-border bg-popover/90 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-ring transition-all shadow-lg"
				title="Settings"
			>
				<Settings
					className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
				/>
			</button>
		</div>
	);
}

function SettingsPanel({
	children,
	state,
}: {
	children: ReactNode;
	state: "open" | "closing";
}) {
	return (
		<div
			className={[
				"mb-1 w-64 rounded-lg border border-border bg-popover/95 text-popover-foreground backdrop-blur-sm shadow-2xl overflow-hidden",
				"origin-bottom-right duration-150",
				state === "open"
					? "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
					: "animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-2 pointer-events-none",
			].join(" ")}
		>
			{children}
		</div>
	);
}

function SettingsSection({
	children,
	compact = false,
	isLast = false,
}: {
	children: ReactNode;
	compact?: boolean;
	isLast?: boolean;
}) {
	return (
		<div
			className={`${compact ? "px-3 py-2" : "px-3 py-3 space-y-3"} ${
				isLast ? "" : "border-b border-border/70"
			}`}
		>
			{children}
		</div>
	);
}

function SyncStatus({ isSyncing, syncError }: SyncStatusProps) {
	return (
		<div className="flex items-center gap-2">
			{isSyncing ? (
				<Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
			) : syncError ? (
				<CloudOff className="h-3 w-3 text-red-400" />
			) : (
				<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
			)}
			<span className="text-[11px] text-muted-foreground">
				{isSyncing ? "Syncing..." : syncError ? "Sync error" : "Synced"}
			</span>
		</div>
	);
}

function GridSettings({ cols, rows, onChange }: GridSettingsProps) {
	const handleInput = (key: "cols" | "rows", value: string) => {
		const parsed = Number.parseInt(value, 10);
		if (Number.isNaN(parsed)) return;

		onChange(key === "cols" ? parsed : cols, key === "rows" ? parsed : rows);
	};

	return (
		<div>
			<SettingsHeading>Grid size</SettingsHeading>
			<div className="grid grid-cols-2 gap-2">
				<label className="space-y-1 text-[11px] text-muted-foreground">
					Columns
					<input
						type="number"
						min={MIN_GRID_COLS}
						max={MAX_GRID_COLS}
						value={cols}
						onChange={(e) => handleInput("cols", e.target.value)}
						className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
					/>
				</label>
				<label className="space-y-1 text-[11px] text-muted-foreground">
					Rows
					<input
						type="number"
						min={MIN_GRID_ROWS}
						max={MAX_GRID_ROWS}
						value={rows}
						onChange={(e) => handleInput("rows", e.target.value)}
						className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
					/>
				</label>
			</div>
			<p className="mt-2 text-[10px] text-muted-foreground">
				Shrinking hides cells outside the grid without deleting them.
			</p>
		</div>
	);
}

function ColorModeSettings({ colorMode, onChange }: ColorModeSettingsProps) {
	return (
		<div>
			<SettingsHeading>Color mode</SettingsHeading>
			<div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-1">
				{(["light", "dark", "system"] as const).map((option) => (
					<button
						type="button"
						key={option}
						onClick={() => onChange(option)}
						className={`rounded px-2 py-1 text-[11px] capitalize transition-colors ${
							colorMode === option
								? "bg-muted"
								: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
						}`}
					>
						{option}
					</button>
				))}
			</div>
		</div>
	);
}

function ThemeSettings({ theme, onChange }: ThemeSettingsProps) {
	return (
		<div>
			<SettingsHeading>Theme</SettingsHeading>
			<Select
				value={theme}
				onValueChange={(value) => onChange(value as ThemePreference)}
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
	);
}

function OpenInSettings({ openIn, onChange }: OpenInSettingsProps) {
	return (
		<div>
			<SettingsHeading>Open bookmarks in</SettingsHeading>
			<div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-background p-1">
				{(["new-tab", "current-tab"] as const).map((option) => (
					<button
						type="button"
						key={option}
						onClick={() => onChange(option)}
						className={`rounded px-2 py-1 text-[11px] transition-colors ${
							openIn === option
								? "bg-muted"
								: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
						}`}
					>
						{option === "new-tab" ? "New tab" : "Current tab"}
					</button>
				))}
			</div>
		</div>
	);
}

function AccountSettings({ user, onLogout, onSignIn }: AccountSettingsProps) {
	if (!user) {
		return (
			<button
				type="button"
				onClick={onSignIn}
				className="w-full text-left text-xs text-blue-400 hover:text-blue-300 transition-colors"
			>
				Sign in to sync
			</button>
		);
	}

	return (
		<div className="flex items-center justify-between">
			<span className="text-xs text-foreground/80 truncate max-w-30">
				{user.name}
			</span>
			<button
				type="button"
				onClick={onLogout}
				className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
			>
				<LogOut className="h-3 w-3" />
				Sign out
			</button>
		</div>
	);
}

function SettingsHeading({ children }: { children: ReactNode }) {
	return (
		<div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
			{children}
		</div>
	);
}
