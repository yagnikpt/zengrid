import { useEffect, useState } from "react";
import { logout } from "@/lib/auth/oauth";
import { userStorage } from "@/lib/storage";
import type { User } from "@/lib/types";

function App() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadUser() {
			const cachedUser = await userStorage.getValue();
			if (!cancelled) {
				setUser(cachedUser);
				setIsLoading(false);
			}
		}

		loadUser();

		const unwatch = userStorage.watch((newUser: User | null) => {
			if (!cancelled) setUser(newUser);
		});

		return () => {
			cancelled = true;
			unwatch();
		};
	}, []);

	const handleLogout = async () => {
		await logout();
		setUser(null);
	};

	if (isLoading) {
		return (
			<div className="w-64 p-4 text-center">
				<p className="text-sm text-gray-400">Loading...</p>
			</div>
		);
	}

	return (
		<div className="w-64 p-4 bg-gray-900 text-white">
			<h2 className="text-sm font-semibold mb-3">Grid Bookmarks</h2>

			{user ? (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-xs font-medium">{user.name}</p>
							<p className="text-[10px] text-gray-400">{user.email}</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="w-full py-1.5 px-3 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
					>
						Sign out
					</button>
				</div>
			) : (
				<div className="space-y-2">
					<p className="text-xs text-gray-400">
						Not signed in. Open a new tab to access your bookmarks grid.
					</p>
				</div>
			)}

			<div className="mt-3 pt-3 border-t border-gray-800">
				<p className="text-[10px] text-gray-500">
					Open a new tab to manage your bookmarks
				</p>
			</div>
		</div>
	);
}

export default App;
