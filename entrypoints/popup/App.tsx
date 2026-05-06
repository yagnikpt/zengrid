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
				<p className="text-sm text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="w-64 p-4">
			<h2 className="text-sm font-semibold mb-3">ZenGrid</h2>

			{user ? (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-xs font-medium">{user.name}</p>
							<p className="text-[10px] text-muted-foreground">{user.email}</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="w-full py-1.5 px-3 rounded-md text-xs bg-muted text-card-foreground"
					>
						Sign out
					</button>
				</div>
			) : (
				<div className="space-y-2">
					<p className="text-xs">
						Not signed in. Open a new tab to access your bookmarks grid.
					</p>
				</div>
			)}

			<div className="mt-3 pt-3 border-t">
				<p className="text-[10px] text-muted-foreground">
					Open a new tab to manage your bookmarks
				</p>
			</div>
		</div>
	);
}

export default App;
