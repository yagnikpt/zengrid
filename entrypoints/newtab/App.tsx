import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Grid } from "@/components/Grid";
import { SettingsMenu } from "@/components/SettingsMenu";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGrid } from "@/lib/hooks/useGrid";

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
				settings.theme === "dark" ||
				(settings.theme === "system" && mediaQuery.matches);

			root.classList.toggle("dark", shouldUseDark);
			root.classList.toggle("light", !shouldUseDark);
		};

		applyTheme();
		mediaQuery.addEventListener("change", applyTheme);

		return () => mediaQuery.removeEventListener("change", applyTheme);
	}, [settings.theme]);

	if (isAuthLoading || isGridLoading) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-background">
				<div className="text-sm text-muted-foreground animate-pulse">
					Loading...
				</div>
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
				/>
			</main>

			<SettingsMenu
				user={user}
				isAuthenticated={isAuthenticated}
				isSyncing={isSyncing}
				syncError={syncError}
				settings={settings}
				onGridDimensionsChange={updateGridDimensions}
				onThemeChange={updateTheme}
				onOpenInChange={updateOpenIn}
				onLogout={logout}
				onSignIn={() => setShowAuth(true)}
			/>
		</div>
	);
}
