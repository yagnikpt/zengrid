import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Grid } from "@/components/Grid";
import { SettingsMenu } from "@/components/SettingsMenu";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGrid } from "@/lib/hooks/useGrid";
import { resolveColorMode } from "@/lib/themes";

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

	useEffect(() => {
		const root = document.documentElement;
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const applyTheme = () => {
			const shouldUseDark =
				resolveColorMode(settings.colorMode, mediaQuery.matches) === "dark";

			root.classList.toggle("dark", shouldUseDark);
			root.classList.toggle("light", !shouldUseDark);
			root.dataset.theme = settings.theme;
		};

		applyTheme();
		mediaQuery.addEventListener("change", applyTheme);

		return () => mediaQuery.removeEventListener("change", applyTheme);
	}, [settings.colorMode, settings.theme]);

	const resolvedColorMode =
		resolveColorMode(
			settings.colorMode,
			window.matchMedia("(prefers-color-scheme: dark)").matches,
		);

	if (isAuthLoading || isGridLoading) {
		return (
			<div className="h-screen w-screen bg-background text-foreground overflow-hidden">
				<main className="w-full h-full border-t border-l border-border/60">
					<div
						className="grid w-full h-full"
						style={{
							gridTemplateColumns: `repeat(${settings.grid.cols}, minmax(0, 1fr))`,
							gridTemplateRows: `repeat(${settings.grid.rows}, minmax(0, 1fr))`,
						}}
					>
						<EmptyCell />
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
		<div className="h-screen w-screen bg-background text-foreground overflow-hidden">
			<main className="w-full h-full border-t border-l border-border/60">
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
				/>
			</main>

			<SettingsMenu
				user={user}
				isAuthenticated={isAuthenticated}
				isSyncing={isSyncing}
				syncError={syncError}
				settings={settings}
				onGridDimensionsChange={updateGridDimensions}
				onColorModeChange={updateColorMode}
				onThemeChange={updateTheme}
				onOpenInChange={updateOpenIn}
				onLogout={logout}
				onSignIn={() => setShowAuth(true)}
			/>
		</div>
	);
}
