export default defineBackground(() => {
	console.log("Grid Bookmarks background initialized", {
		id: browser.runtime.id,
	});

	// Listen for messages from popup/newtab
	browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (message.type === "GET_AUTH_STATUS") {
			storage.getItem("session:authTokens").then((tokens) => {
				sendResponse({ isAuthenticated: tokens !== null });
			});
			return true;
		}

		if (message.type === "SYNC_GRID") {
			console.log("Grid sync requested from:", _sender.tab?.id);
			sendResponse({ ok: true });
			return true;
		}

		if (message.type === "FETCH_PAGE_TITLE") {
			fetchTitle(message.url).then((title) => {
				sendResponse({ title });
			});
			return true; // Keep channel open for async response
		}

		return false;
	});

	// Handle extension install/update
	browser.runtime.onInstalled.addListener((details) => {
		if (details.reason === "install") {
			console.log("Grid Bookmarks installed");
		} else if (details.reason === "update") {
			console.log("Grid Bookmarks updated");
		}
	});
});

/**
 * Fetch a page's <title> from the background service worker.
 * Background context is not subject to CORS restrictions.
 */
async function fetchTitle(url: string): Promise<string | null> {
	try {
		const response = await fetch(url, {
			method: "GET",
			headers: { Accept: "text/html" },
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) return null;

		const reader = response.body?.getReader();
		if (!reader) return null;

		const decoder = new TextDecoder();
		let html = "";

		// Read up to ~16KB — <title> is always in the <head>
		for (let i = 0; i < 4; i++) {
			const { done, value } = await reader.read();
			if (value) html += decoder.decode(value, { stream: true });

			const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
			if (match) {
				reader.cancel();
				const title = match[1]
					.replace(/&amp;/g, "&")
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/\s+/g, " ")
					.trim();
				return title || null;
			}

			if (done) break;
		}

		reader.cancel();
		return null;
	} catch {
		return null;
	}
}
