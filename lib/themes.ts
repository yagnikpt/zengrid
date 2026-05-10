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
	{ name: "color2", accent: "#6B782E", bg: "rgba(107, 120, 46, 0.2)" },
	{ name: "color3", accent: "#45707A", bg: "rgba(69, 112, 122, 0.2)" },
	{ name: "color4", accent: "#B37109", bg: "rgba(179, 113, 9, 0.2)" },
	{ name: "color5", accent: "#945E80", bg: "rgba(148, 94, 128, 0.2)" },
	{ name: "color6", accent: "#C25E0A", bg: "rgba(194, 94, 10, 0.2)" },
	{ name: "color7", accent: "#4C7A5D", bg: "rgba(76, 122, 93, 0.2)" },
	{ name: "color8", accent: "#644735", bg: "rgba(100, 71, 53, 0.2)" },
];

export const GRUVBOX_DARK_ACCENT_COLORS: AccentColor[] = [
	{ name: "color1", accent: "#E96962", bg: "rgba(233, 105, 98, 0.2)" },
	{ name: "color2", accent: "#A8B665", bg: "rgba(168, 182, 101, 0.2)" },
	{ name: "color3", accent: "#7DAEA3", bg: "rgba(125, 174, 163, 0.2)" },
	{ name: "color4", accent: "#D7A657", bg: "rgba(215, 166, 87, 0.2)" },
	{ name: "color5", accent: "#D3869B", bg: "rgba(211, 134, 155, 0.2)" },
	{ name: "color6", accent: "#E68A4E", bg: "rgba(230, 138, 78, 0.2)" },
	{ name: "color7", accent: "#89B482", bg: "rgba(137, 180, 130, 0.2)" },
	{ name: "color8", accent: "#D4BE98", bg: "rgba(212, 190, 152, 0.2)" },
];

export const THEMES: ThemeDefinition[] = [
	{
		id: "classic",
		name: "Classic",
		lightAccent: CLASSIC_ACCENT_COLORS,
		darkAccent: CLASSIC_ACCENT_COLORS,
	},
	{
		id: "gruvbox",
		name: "Gruvbox",
		lightAccent: GRUVBOX_LIGHT_ACCENT_COLORS,
		darkAccent: GRUVBOX_DARK_ACCENT_COLORS,
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

	const sameThemeByAccent = themeColors.find((color) => color.accent === accentColor);
	if (sameThemeByAccent) return sameThemeByAccent;

	const legacy = allAccentColors.find((color) => color.accent === accentColor);
	if (!legacy) return undefined;

	return themeColors.find((color) => color.name === legacy.name) ?? legacy;
}
