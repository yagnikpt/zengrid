import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	dev: {
		server: {
			port: 3482,
		},
	},
	manifest: {
		name: "Grid Bookmarks",
		description:
			"A beautiful grid-based bookmark manager for your new tab page",
		permissions: ["storage", "identity"],
		host_permissions: ["https://*/*", "http://*/*"],
	},
	vite: () => ({
		plugins: [tailwindcss()],
	}),
});
