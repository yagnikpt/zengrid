import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	dev: {
		server: {
			port: 3482,
		},
	},
	manifest: {
		name: "ZenGrid",
		description:
			"A beautiful grid-based bookmark manager for your new tab page.",
		permissions: ["storage", "identity"],
		host_permissions: ["https://*/*", "http://*/*"],
		browser_specific_settings: {
			gecko: {
				id: "zengrid@local",
			},
		},
		version: "0.1.0",
	},
	vite: () => ({
		plugins: [tailwindcss()],
	}),
});
