import type { ColorModePreference, ThemePreference } from "./types";

export interface AccentColor {
	name: string;
	accent: string;
	bg: string;
}

export interface ThemeDefinition {
	id: ThemePreference;
	name: string;
	lightAccent: AccentColor[];
	darkAccent: AccentColor[];
}

/**
 * Accent sequence used across all themes:
 * red → orange → yellow → green → teal → blue → indigo → purple/pink
 */
export const CLASSIC_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)" },
	{ name: "color2", accent: "#f97316", bg: "rgba(249, 115, 22, 0.2)" },
	{ name: "color3", accent: "#eab308", bg: "rgba(234, 179, 8, 0.2)" },
	{ name: "color4", accent: "#84cc16", bg: "rgba(132, 204, 22, 0.2)" },
	{ name: "color5", accent: "#10b981", bg: "rgba(16, 185, 129, 0.2)" },
	{ name: "color6", accent: "#0ea5e9", bg: "rgba(14, 165, 233, 0.2)" },
	{ name: "color7", accent: "#6366f1", bg: "rgba(99, 102, 241, 0.2)" },
	{ name: "color8", accent: "#a855f7", bg: "rgba(168, 85, 247, 0.2)" },
];

export const GRUVBOX_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#C04A4A", bg: "rgba(192, 74, 74, 0.2)" },
	{ name: "color2", accent: "#C25E0A", bg: "rgba(194, 94, 10, 0.2)" },
	{ name: "color3", accent: "#B37109", bg: "rgba(179, 113, 9, 0.2)" },
	{ name: "color4", accent: "#6B782E", bg: "rgba(107, 120, 46, 0.2)" },
	{ name: "color5", accent: "#4C7A5D", bg: "rgba(76, 122, 93, 0.2)" },
	{ name: "color6", accent: "#45707A", bg: "rgba(69, 112, 122, 0.2)" },
	{ name: "color7", accent: "#945E80", bg: "rgba(148, 94, 128, 0.2)" },
	{ name: "color8", accent: "#644735", bg: "rgba(100, 71, 53, 0.2)" },
];

export const GRUVBOX_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#E96962", bg: "rgba(233, 105, 98, 0.2)" },
	{ name: "color2", accent: "#E68A4E", bg: "rgba(230, 138, 78, 0.2)" },
	{ name: "color3", accent: "#D7A657", bg: "rgba(215, 166, 87, 0.2)" },
	{ name: "color4", accent: "#A8B665", bg: "rgba(168, 182, 101, 0.2)" },
	{ name: "color5", accent: "#89B482", bg: "rgba(137, 180, 130, 0.2)" },
	{ name: "color6", accent: "#7DAEA3", bg: "rgba(125, 174, 163, 0.2)" },
	{ name: "color7", accent: "#D3869B", bg: "rgba(211, 134, 155, 0.2)" },
	{ name: "color8", accent: "#D4BE98", bg: "rgba(212, 190, 152, 0.2)" },
];

export const CATPPUCCIN_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#d20f39", bg: "rgba(210, 15, 57, 0.2)" },
	{ name: "color2", accent: "#fe640b", bg: "rgba(254, 100, 11, 0.2)" },
	{ name: "color3", accent: "#df8e1d", bg: "rgba(223, 142, 29, 0.2)" },
	{ name: "color4", accent: "#40a02b", bg: "rgba(64, 160, 43, 0.2)" },
	{ name: "color5", accent: "#179299", bg: "rgba(23, 146, 153, 0.2)" },
	{ name: "color6", accent: "#1e66f5", bg: "rgba(30, 102, 245, 0.2)" },
	{ name: "color7", accent: "#7287fd", bg: "rgba(114, 135, 253, 0.2)" },
	{ name: "color8", accent: "#8839ef", bg: "rgba(136, 57, 239, 0.2)" },
];

export const CATPPUCCIN_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#f38ba8", bg: "rgba(243, 139, 168, 0.2)" },
	{ name: "color2", accent: "#fab387", bg: "rgba(250, 179, 135, 0.2)" },
	{ name: "color3", accent: "#f9e2af", bg: "rgba(249, 226, 175, 0.2)" },
	{ name: "color4", accent: "#a6e3a1", bg: "rgba(166, 227, 161, 0.2)" },
	{ name: "color5", accent: "#94e2d5", bg: "rgba(148, 226, 213, 0.2)" },
	{ name: "color6", accent: "#89b4fa", bg: "rgba(137, 180, 250, 0.2)" },
	{ name: "color7", accent: "#b4befe", bg: "rgba(180, 190, 254, 0.2)" },
	{ name: "color8", accent: "#cba6f7", bg: "rgba(203, 166, 247, 0.2)" },
];

export const GITHUB_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#d73a49", bg: "rgba(215, 58, 73, 0.2)" },
	{ name: "color2", accent: "#f66a0a", bg: "rgba(246, 106, 10, 0.2)" },
	{ name: "color3", accent: "#dbab09", bg: "rgba(219, 171, 9, 0.2)" },
	{ name: "color4", accent: "#28a745", bg: "rgba(40, 167, 69, 0.2)" },
	{ name: "color5", accent: "#1b7c83", bg: "rgba(27, 124, 131, 0.2)" },
	{ name: "color6", accent: "#0366d6", bg: "rgba(3, 102, 214, 0.2)" },
	{ name: "color7", accent: "#6f42c1", bg: "rgba(111, 66, 193, 0.2)" },
	{ name: "color8", accent: "#ea4aaa", bg: "rgba(234, 74, 170, 0.2)" },
];

export const GITHUB_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#ea4a5a", bg: "rgba(234, 74, 90, 0.2)" },
	{ name: "color2", accent: "#fb8532", bg: "rgba(251, 133, 50, 0.2)" },
	{ name: "color3", accent: "#ffea7f", bg: "rgba(255, 234, 127, 0.2)" },
	{ name: "color4", accent: "#34d058", bg: "rgba(52, 208, 88, 0.2)" },
	{ name: "color5", accent: "#39c5cf", bg: "rgba(57, 197, 207, 0.2)" },
	{ name: "color6", accent: "#2188ff", bg: "rgba(33, 136, 255, 0.2)" },
	{ name: "color7", accent: "#b392f0", bg: "rgba(179, 146, 240, 0.2)" },
	{ name: "color8", accent: "#ec6cb9", bg: "rgba(236, 108, 185, 0.2)" },
];

export const TOKYONIGHT_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#f52a65", bg: "rgba(245, 42, 101, 0.2)" },
	{ name: "color2", accent: "#b15c00", bg: "rgba(177, 92, 0, 0.2)" },
	{ name: "color3", accent: "#8c6c3e", bg: "rgba(140, 108, 62, 0.2)" },
	{ name: "color4", accent: "#587539", bg: "rgba(88, 117, 57, 0.2)" },
	{ name: "color5", accent: "#118c74", bg: "rgba(17, 140, 116, 0.2)" },
	{ name: "color6", accent: "#2e7de9", bg: "rgba(46, 125, 233, 0.2)" },
	{ name: "color7", accent: "#7847bd", bg: "rgba(120, 71, 189, 0.2)" },
	{ name: "color8", accent: "#9854f1", bg: "rgba(152, 84, 241, 0.2)" },
];

export const TOKYONIGHT_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#f7768e", bg: "rgba(247, 118, 142, 0.2)" },
	{ name: "color2", accent: "#ff9e64", bg: "rgba(255, 158, 100, 0.2)" },
	{ name: "color3", accent: "#e0af68", bg: "rgba(224, 175, 104, 0.2)" },
	{ name: "color4", accent: "#9ece6a", bg: "rgba(158, 206, 106, 0.2)" },
	{ name: "color5", accent: "#1abc9c", bg: "rgba(26, 188, 156, 0.2)" },
	{ name: "color6", accent: "#7aa2f7", bg: "rgba(122, 162, 247, 0.2)" },
	{ name: "color7", accent: "#9d7cd8", bg: "rgba(157, 124, 216, 0.2)" },
	{ name: "color8", accent: "#bb9af7", bg: "rgba(187, 154, 247, 0.2)" },
];

export const ROSEPINE_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#b4637a", bg: "rgba(180, 99, 122, 0.2)" },
	{ name: "color2", accent: "#d7827e", bg: "rgba(215, 130, 126, 0.2)" },
	{ name: "color3", accent: "#ea9d34", bg: "rgba(234, 157, 52, 0.2)" },
	{ name: "color4", accent: "#286983", bg: "rgba(40, 105, 131, 0.2)" },
	{ name: "color5", accent: "#56949f", bg: "rgba(86, 148, 159, 0.2)" },
	{ name: "color6", accent: "#907aa9", bg: "rgba(144, 122, 169, 0.2)" },
	{ name: "color7", accent: "#797593", bg: "rgba(121, 117, 147, 0.2)" },
	{ name: "color8", accent: "#9893a5", bg: "rgba(152, 147, 165, 0.2)" },
];

export const ROSEPINE_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#eb6f92", bg: "rgba(235, 111, 146, 0.2)" },
	{ name: "color2", accent: "#ebbcba", bg: "rgba(235, 188, 186, 0.2)" },
	{ name: "color3", accent: "#f6c177", bg: "rgba(246, 193, 119, 0.2)" },
	{ name: "color4", accent: "#31748f", bg: "rgba(49, 116, 143, 0.2)" },
	{ name: "color5", accent: "#9ccfd8", bg: "rgba(156, 207, 216, 0.2)" },
	{ name: "color6", accent: "#c4a7e7", bg: "rgba(196, 167, 231, 0.2)" },
	{ name: "color7", accent: "#908caa", bg: "rgba(144, 140, 170, 0.2)" },
	{ name: "color8", accent: "#6e6a86", bg: "rgba(110, 106, 134, 0.2)" },
];

export const KANAGAWA_LIGHT_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#c84053", bg: "rgba(200, 64, 83, 0.2)" },
	{ name: "color2", accent: "#cc6d00", bg: "rgba(204, 109, 0, 0.2)" },
	{ name: "color3", accent: "#de9800", bg: "rgba(222, 152, 0, 0.2)" },
	{ name: "color4", accent: "#6f894e", bg: "rgba(111, 137, 78, 0.2)" },
	{ name: "color5", accent: "#597b75", bg: "rgba(89, 123, 117, 0.2)" },
	{ name: "color6", accent: "#4d699b", bg: "rgba(77, 105, 155, 0.2)" },
	{ name: "color7", accent: "#5d57a3", bg: "rgba(93, 87, 163, 0.2)" },
	{ name: "color8", accent: "#a09cac", bg: "rgba(160, 156, 172, 0.2)" },
];

export const KANAGAWA_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#c4746e", bg: "rgba(196, 116, 110, 0.2)" },
	{ name: "color2", accent: "#b6927b", bg: "rgba(182, 146, 123, 0.2)" },
	{ name: "color3", accent: "#c4b28a", bg: "rgba(196, 178, 138, 0.2)" },
	{ name: "color4", accent: "#8a9a7b", bg: "rgba(138, 154, 123, 0.2)" },
	{ name: "color5", accent: "#8ea4a2", bg: "rgba(142, 164, 162, 0.2)" },
	{ name: "color6", accent: "#8ba4b0", bg: "rgba(139, 164, 176, 0.2)" },
	{ name: "color7", accent: "#8992a7", bg: "rgba(137, 146, 167, 0.2)" },
	{ name: "color8", accent: "#a292a3", bg: "rgba(162, 146, 163, 0.2)" },
];

export const THEMES: ThemeDefinition[] = [
	{
		id: "classic",
		name: "Classic",
		lightAccent: CLASSIC_ACCENT_COLORS,
		darkAccent: CLASSIC_ACCENT_COLORS,
	},
	{
		id: "catppuccin",
		name: "Catppuccin",
		lightAccent: CATPPUCCIN_LIGHT_ACCENT_COLORS,
		darkAccent: CATPPUCCIN_DARK_ACCENT_COLORS,
	},
	{
		id: "github",
		name: "GitHub",
		lightAccent: GITHUB_LIGHT_ACCENT_COLORS,
		darkAccent: GITHUB_DARK_ACCENT_COLORS,
	},
	{
		id: "gruvbox",
		name: "Gruvbox",
		lightAccent: GRUVBOX_LIGHT_ACCENT_COLORS,
		darkAccent: GRUVBOX_DARK_ACCENT_COLORS,
	},
	{
		id: "kanagawa",
		name: "Kanagawa",
		lightAccent: KANAGAWA_LIGHT_ACCENT_COLORS,
		darkAccent: KANAGAWA_DARK_ACCENT_COLORS,
	},
	{
		id: "rosepine",
		name: "Rosé Pine",
		lightAccent: ROSEPINE_LIGHT_ACCENT_COLORS,
		darkAccent: ROSEPINE_DARK_ACCENT_COLORS,
	},
	{
		id: "tokyonight",
		name: "Tokyo Night",
		lightAccent: TOKYONIGHT_LIGHT_ACCENT_COLORS,
		darkAccent: TOKYONIGHT_DARK_ACCENT_COLORS,
	},
];

const allAccentColors = THEMES.flatMap((theme) => [
	...theme.lightAccent,
	...theme.darkAccent,
]);

export function resolveColorMode(
	colorMode: ColorModePreference,
	prefersDark: boolean,
): "light" | "dark" {
	if (colorMode === "system") {
		return prefersDark ? "dark" : "light";
	}
	return colorMode;
}

export function getThemeById(themeId: ThemePreference): ThemeDefinition {
	return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
}

export function getAccentColors(
	themeId: ThemePreference,
	colorMode: "light" | "dark",
): AccentColor[] {
	const theme = getThemeById(themeId);
	return colorMode === "dark" ? theme.darkAccent : theme.lightAccent;
}

export function resolveAccentColor(
	accentColor: string | undefined,
	themeId: ThemePreference,
	colorMode: "light" | "dark",
): AccentColor | undefined {
	if (!accentColor) return undefined;

	const themeColors = getAccentColors(themeId, colorMode);

	const byName = themeColors.find((color) => color.name === accentColor);
	if (byName) return byName;

	const sameThemeByAccent = themeColors.find(
		(color) => color.accent === accentColor,
	);
	if (sameThemeByAccent) return sameThemeByAccent;

	const legacy = allAccentColors.find((color) => color.accent === accentColor);
	if (!legacy) return undefined;

	return themeColors.find((color) => color.name === legacy.name) ?? legacy;
}
