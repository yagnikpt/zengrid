import { useState } from "react";
import { AuthGate, FloatingMenu } from "@/components/AuthGate";
import { Grid } from "@/components/Grid";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGrid } from "@/lib/hooks/useGrid";

export default function App() {
	const {
		cells,
		isLoading: isGridLoading,
		isSyncing,
		syncError,
		swap,
		updateCell,
		removeCell,
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

	if (isAuthLoading || isGridLoading) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-black">
				<div className="text-sm text-gray-400 animate-pulse">Loading...</div>
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
				isLoggingIn={isLoggingIn}
				error={authError}
			/>
		);
	}

	return (
		<div className="h-screen w-screen bg-black overflow-hidden">
			<main className="w-full h-full border-t border-l border-white/[0.06]">
				<Grid
					cells={cells}
					onSwap={swap}
					onUpdateCell={updateCell}
					onRemoveCell={removeCell}
				/>
			</main>

			<FloatingMenu
				user={user}
				isAuthenticated={isAuthenticated}
				isSyncing={isSyncing}
				syncError={syncError}
				onLogout={logout}
				onSignIn={() => setShowAuth(true)}
			/>
		</div>
	);
}
