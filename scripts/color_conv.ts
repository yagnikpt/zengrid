import { oklch, rgb } from "culori";

/**
 * Converts a hex color string to an RGB color string.
 *
 * @param hex - The hex color string to convert
 * @returns The RGB color string in format `r,g,b`
 */
const hexToRgb = (hex: string) => {
	const c = rgb(hex);
	if (!c) throw new Error(`Invalid hex color: ${hex}`);
	return [c.r, c.g, c.b].join(",");
};

/**
 * Converts a hex color string to an OKLCH color string.
 *
 * @param hex - The hex color string to convert
 * @returns The OKLCH color string in format `l c h`
 */
const hexToOklch = (hex: string) => {
	const c = oklch(hex);
	if (!c) throw new Error(`Invalid hex color: ${hex}`);
	return `${c.l} ${c.c} ${c.h}`;
};

const args = process.argv.slice(2);

const mode = args[0];
const hex = args[1];
const result = mode === "oklch" ? hexToOklch(hex) : hexToRgb(hex);
console.log(result);
