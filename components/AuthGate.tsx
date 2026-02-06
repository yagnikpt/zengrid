import { useState } from "react";
import { Settings, LogOut, CloudOff, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

interface AuthGateProps {
	onLogin: (provider: "google" | "github") => void;
	isLoggingIn: boolean;
	error: string | null;
}

export function AuthGate({ onLogin, isLoggingIn, error }: AuthGateProps) {
	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
			<div className="text-center p-8 max-w-sm">
				<h1 className="text-2xl font-bold text-white mb-2">Grid Bookmarks</h1>
				<p className="text-sm text-gray-400 mb-8">
					Sign in to sync your bookmarks across devices
				</p>

				<div className="space-y-3">
					<button
						type="button"
						onClick={() => onLogin("google")}
						disabled={isLoggingIn}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						{isLoggingIn ? "Signing in..." : "Continue with Google"}
					</button>

					<button
						type="button"
						onClick={() => onLogin("github")}
						disabled={isLoggingIn}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 text-white font-medium text-sm border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
						</svg>
						{isLoggingIn ? "Signing in..." : "Continue with GitHub"}
					</button>
				</div>

				{error && <p className="mt-4 text-xs text-red-400">{error}</p>}

				<button
					type="button"
					onClick={() => onLogin("google")}
					className="mt-6 text-xs text-gray-500 hover:text-gray-400 transition-colors"
				>
					Skip for now (use locally)
				</button>
			</div>
		</div>
	);
}

// ── Floating Menu (bottom-right) ────────────────────────────

interface FloatingMenuProps {
	user: User | null;
	isAuthenticated: boolean;
	isSyncing: boolean;
	syncError: string | null;
	onLogout: () => void;
	onSignIn: () => void;
}

export function FloatingMenu({
	user,
	isAuthenticated,
	isSyncing,
	syncError,
	onLogout,
	onSignIn,
}: FloatingMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
			{/* Expanded menu */}
			{isOpen && (
				<div className="mb-1 w-52 rounded-lg border border-white/10 bg-black/90 backdrop-blur-sm shadow-2xl overflow-hidden">
					{/* Sync status */}
					{isAuthenticated && (
						<div className="px-3 py-2 border-b border-white/5">
							<div className="flex items-center gap-2">
								{isSyncing ? (
									<Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
								) : syncError ? (
									<CloudOff className="h-3 w-3 text-red-400" />
								) : (
									<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
								)}
								<span className="text-[11px] text-white/50">
									{isSyncing
										? "Syncing..."
										: syncError
											? "Sync error"
											: "Synced"}
								</span>
							</div>
						</div>
					)}

					{/* User info / Sign in */}
					<div className="px-3 py-2">
						{user ? (
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/70 truncate max-w-[120px]">
									{user.name}
								</span>
								<button
									type="button"
									onClick={() => {
										onLogout();
										setIsOpen(false);
									}}
									className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
								>
									<LogOut className="h-3 w-3" />
									Sign out
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={() => {
									onSignIn();
									setIsOpen(false);
								}}
								className="w-full text-left text-xs text-blue-400 hover:text-blue-300 transition-colors"
							>
								Sign in to sync
							</button>
						)}
					</div>
				</div>
			)}

			{/* Toggle button */}
			<button
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-black/80 backdrop-blur-sm text-white/40 hover:text-white/70 hover:border-white/20 transition-all shadow-lg"
				title="Settings"
			>
				<Settings
					className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
				/>
			</button>
		</div>
	);
}
