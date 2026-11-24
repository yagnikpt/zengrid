import { useEffect, useState } from "react";
import { AppearanceModal } from "@/components/AppearanceModal";
import { AuthGate } from "@/components/AuthGate";
import { EmptyCell } from "@/components/EmptyCell";
import { Grid } from "@/components/Grid";
import { SettingsMenu } from "@/components/SettingsMenu";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGrid } from "@/lib/hooks/useGrid";
import { resolveColorMode } from "@/lib/themes";
import { cn } from "@/lib/utils";

export default function App() {
	const {
		cells,
		isLoading: isGridLoading,
		isSyncing,
		syncError,
		settings,
		swap,
		updateCell,
		removeCell,
		removeCells,
		setAccentColor,
		updateGridDimensions,
		updateColorMode,
		updateTheme,
		updateStyle,
		updateOpenIn,
	} = useGrid();

	const {
		user,
		isAuthenticated,
		isLoading: isAuthLoading,
		isLoggingIn,
		error: authError,
		login,
		logout,
	} = useAuth();

	const [showAuth, setShowAuth] = useState(false);
	const [showAppearance, setShowAppearance] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const applyTheme = () => {
			const shouldUseDark =
				resolveColorMode(settings.colorMode, mediaQuery.matches) === "dark";

			root.classList.toggle("dark", shouldUseDark);
			root.classList.toggle("light", !shouldUseDark);
			root.dataset.theme = settings.theme;
			root.dataset.style = settings.style;
		};

		applyTheme();
		mediaQuery.addEventListener("change", applyTheme);

		return () => mediaQuery.removeEventListener("change", applyTheme);
	}, [settings.colorMode, settings.theme, settings.style]);

	const resolvedColorMode =
		resolveColorMode(
			settings.colorMode,
			window.matchMedia("(prefers-color-scheme: dark)").matches,
		);

	if (isAuthLoading || isGridLoading) {
		return (
			<div
				className={cn(
					"h-screen w-screen bg-background text-foreground overflow-hidden",
					settings.style === "terminal" && "bg-[#090c10]",
					settings.style === "paper" && "bg-[#faf6ee] dark:bg-[#1f1e1c]",
				)}
			>
				<main
					className={cn(
						"w-full h-full",
						settings.style === "classic" && "border-t border-l border-border/60",
					)}
				>
					<div
						className="grid w-full h-full"
						style={{
							gridTemplateColumns: `repeat(${settings.grid.cols}, minmax(0, 1fr))`,
							gridTemplateRows: `repeat(${settings.grid.rows}, minmax(0, 1fr))`,
						}}
					>
						<EmptyCell style={settings.style} />
					</div>
					<Grid
						cells={cells}
						cols={settings.grid.cols}
						rows={settings.grid.rows}
						openIn={settings.openIn}
						onSwap={swap}
						onUpdateCell={updateCell}
						onRemoveCell={removeCell}
						onRemoveCells={removeCells}
						onSetAccentColor={setAccentColor}
						theme={settings.theme}
						colorMode={resolvedColorMode}
						gridStyle={settings.style}
					/>
				</main>
			</div>
		);
	}

	if (showAuth && !isAuthenticated) {
		return (
			<AuthGate
				onLogin={async (provider) => {
					await login(provider);
					setShowAuth(false);
				}}
				onSkip={() => setShowAuth(false)}
				isLoggingIn={isLoggingIn}
				error={authError}
			/>
		);
	}

	return (
		<div
			className={cn(
				"h-screen w-screen bg-background text-foreground overflow-hidden",
				settings.style === "terminal" && "bg-[#090c10]",
				settings.style === "paper" && "bg-[#faf6ee] dark:bg-[#1f1e1c]",
			)}
		>
			<main
				className={cn(
					"w-full h-full",
					settings.style === "classic" && "border-t border-l border-border/60",
				)}
			>
				<Grid
					cells={cells}
					cols={settings.grid.cols}
					rows={settings.grid.rows}
					openIn={settings.openIn}
					onSwap={swap}
					onUpdateCell={updateCell}
					onRemoveCell={removeCell}
					onRemoveCells={removeCells}
					onSetAccentColor={setAccentColor}
					theme={settings.theme}
					colorMode={resolvedColorMode}
					gridStyle={settings.style}
				/>
			</main>

			<SettingsMenu
				user={user}
				isAuthenticated={isAuthenticated}
				isSyncing={isSyncing}
				syncError={syncError}
				settings={settings}
				onGridDimensionsChange={updateGridDimensions}
				onOpenInChange={updateOpenIn}
				isAppearanceOpen={showAppearance}
				onOpenAppearance={() => setShowAppearance((prev) => !prev)}
				onCloseAppearance={() => setShowAppearance(false)}
				onLogout={logout}
				onSignIn={() => setShowAuth(true)}
			/>

			<AppearanceModal
				isOpen={showAppearance}
				onClose={() => setShowAppearance(false)}
				style={settings.style}
				onStyleChange={updateStyle}
				colorMode={settings.colorMode}
				onColorModeChange={updateColorMode}
				theme={settings.theme}
				onThemeChange={updateTheme}
			/>
		</div>
	);
}
