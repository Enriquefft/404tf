#!/bin/bun
/**
 * Screenshot utility for local/remote pages.
 *
 * Usage:
 *   bun run scripts/screenshot.ts <url> [output] [options]
 *
 * Options:
 *   --selector=<css>     Clip to the first element matching a CSS selector
 *                        (e.g. "footer", "#hero"). Overrides --full.
 *   --full               Capture full page (default when no --selector).
 *   --viewport=<WxH>     Browser viewport, e.g. 1440x900 (default), 390x844.
 *   --theme=<light|dark> Force prefers-color-scheme (default: follows page).
 *   --wait=<ms>          Extra wait after load before capturing.
 *   --device=<mobile>    Shortcut for 390x844 + mobile UA.
 *
 * Examples:
 *   bun run screenshot http://localhost:4321/es /tmp/home.png
 *   bun run screenshot http://localhost:4321/es /tmp/footer.png --selector=footer
 *   bun run screenshot https://map.404tf.com/es shot.png --device=mobile --theme=dark
 */

import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

type Viewport = { width: number; height: number };
type Theme = "light" | "dark" | "no-preference";

type Args = {
	url: string;
	output: string;
	selector?: string;
	full: boolean;
	viewport: Viewport;
	theme: Theme;
	waitMs: number;
	userAgent?: string;
};

const MOBILE_VIEWPORT: Viewport = { width: 390, height: 844 };
const MOBILE_UA =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function parseViewport(raw: string): Viewport {
	const match = /^(\d+)x(\d+)$/.exec(raw);
	if (!match) throw new Error(`Invalid --viewport: ${raw} (expected WxH)`);
	return { width: Number(match[1]), height: Number(match[2]) };
}

function parseTheme(raw: string): Theme {
	if (raw === "light" || raw === "dark" || raw === "no-preference") return raw;
	throw new Error(`Invalid --theme: ${raw} (expected light|dark|no-preference)`);
}

function slugForOutput(url: string): string {
	const u = new URL(url);
	const path = u.pathname
		.replace(/\/$/, "")
		.replace(/[^\w]+/g, "-")
		.replace(/^-|-$/g, "");
	return path || "root";
}

function parseArgs(argv: readonly string[]): Args {
	const positional: string[] = [];
	let selector: string | undefined;
	let full = false;
	let viewport: Viewport = { width: 1440, height: 900 };
	let theme: Theme = "no-preference";
	let waitMs = 0;
	let userAgent: string | undefined;

	for (const arg of argv) {
		if (arg === "--full") full = true;
		else if (arg.startsWith("--selector=")) selector = arg.slice(11);
		else if (arg.startsWith("--viewport=")) viewport = parseViewport(arg.slice(11));
		else if (arg.startsWith("--theme=")) theme = parseTheme(arg.slice(8));
		else if (arg.startsWith("--wait=")) waitMs = Number.parseInt(arg.slice(7), 10) || 0;
		else if (arg === "--device=mobile") {
			viewport = MOBILE_VIEWPORT;
			userAgent = MOBILE_UA;
		} else if (arg.startsWith("--")) {
			throw new Error(`Unknown flag: ${arg}`);
		} else {
			positional.push(arg);
		}
	}

	const url = positional[0];
	if (!url) {
		throw new Error(
			"Usage: bun run scripts/screenshot.ts <url> [output] [--selector=css] [--full] [--viewport=WxH] [--theme=light|dark] [--wait=ms] [--device=mobile]",
		);
	}

	const output = positional[1] ?? `/tmp/map-${slugForOutput(url)}.png`;
	return { url, output, selector, full, viewport, theme, waitMs, userAgent };
}

const args = parseArgs(process.argv.slice(2));

// Playwright's bundled Chromium lacks system libraries on NixOS. Fall back
// to a system browser found on PATH or via PLAYWRIGHT_CHROMIUM_EXECUTABLE.
async function resolveExecutablePath(): Promise<string | undefined> {
	const override = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
	if (override) return override;
	for (const candidate of ["google-chrome", "chromium", "chrome"]) {
		const result = spawnSync("which", [candidate], { encoding: "utf8" });
		if (result.status === 0) return result.stdout.trim();
	}
	return undefined;
}

const executablePath = await resolveExecutablePath();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({
	viewport: args.viewport,
	colorScheme: args.theme,
	userAgent: args.userAgent,
	deviceScaleFactor: 2,
});

const page = await context.newPage();
await page.goto(args.url, { timeout: 30000, waitUntil: "networkidle" });
if (args.waitMs > 0) await page.waitForTimeout(args.waitMs);

if (args.selector) {
	const element = await page.$(args.selector);
	if (!element) {
		await browser.close();
		throw new Error(`Selector not found on page: ${args.selector}`);
	}
	await element.screenshot({ path: args.output });
} else {
	await page.screenshot({ fullPage: !args.selector || args.full, path: args.output });
}

await browser.close();
console.log(`Saved: ${args.output}`);
