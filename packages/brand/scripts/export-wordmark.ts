/**
 * Wordmark export script — generates PNG + SVG brand assets from logo JSX
 * Uses Satori (JSX -> SVG) + @resvg/resvg-js (SVG -> PNG)
 *
 * Run: bun run export (from packages/brand/)
 *   or: bun run --filter='@404tf/brand' export
 * Output: assets/logos/generated/
 */

import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { type LogoVariant, logoSizes, logoVariants } from "../src/logo.ts";

// ─── Config ────────────────────────────────────────────────────────────────

const ASSETS_DIR = join(import.meta.dir, "../assets");
const OUTPUT_DIR = join(ASSETS_DIR, "logos/generated");
const FONTS_DIR = join(ASSETS_DIR, "fonts");

// ─── Font loading ───────────────────────────────────────────────────────────

async function loadLocalFont(filename: string): Promise<ArrayBuffer> {
    const buf = await readFile(join(FONTS_DIR, filename));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ─── Logo JSX builders ──────────────────────────────────────────────────────

function buildLogoElement(variant: LogoVariant, width: number) {
    const scale = width / 400;
    const mainSize = Math.round(56 * scale);
    const subSize = Math.round(22 * scale);
    const letterSpacing = Math.round(4 * scale * 10) / 10;
    const paddingH = Math.round(24 * scale);
    const paddingV = Math.round(20 * scale);
    const gap = Math.round(6 * scale);
    const height = paddingV * 2 + mainSize + gap + subSize;

    return {
        type: "div",
        props: {
            style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width,
                height,
                backgroundColor: variant.bg,
                paddingTop: paddingV,
                paddingBottom: paddingV,
                paddingLeft: paddingH,
                paddingRight: paddingH,
            },
            children: [
                {
                    type: "div",
                    props: {
                        style: {
                            display: "flex",
                            fontFamily: "Big Shoulders Display",
                            fontWeight: 800,
                            fontSize: mainSize,
                            color: variant.text,
                            marginBottom: gap,
                        },
                        children: "404",
                    },
                },
                {
                    type: "div",
                    props: {
                        style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            fontFamily: "Big Shoulders Display",
                            fontWeight: 500,
                            fontSize: subSize,
                            color: variant.subtext,
                            letterSpacing,
                        },
                        children: [
                            {
                                type: "div",
                                props: { style: { display: "flex" }, children: "TECH\u00A0F" },
                            },
                            {
                                type: "div",
                                props: {
                                    style: {
                                        display: "flex",
                                        textDecoration: "line-through",
                                        textDecorationThickness: Math.max(
                                            1,
                                            Math.round(1.5 * scale),
                                        ),
                                    },
                                    children: "O",
                                },
                            },
                            {
                                type: "div",
                                props: { style: { display: "flex" }, children: "UND" },
                            },
                        ],
                    },
                },
            ],
        },
    };
}

function buildSquareLogoElement(variant: LogoVariant, size: number) {
    const logoWidth = Math.round(size * 0.7);
    const logo = buildLogoElement(variant, logoWidth);

    return {
        type: "div",
        props: {
            style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: size,
                height: size,
                backgroundColor: variant.bg,
            },
            children: [logo],
        },
    };
}

// ─── Render helpers ─────────────────────────────────────────────────────────

type SatoriElement =
    | ReturnType<typeof buildLogoElement>
    | ReturnType<typeof buildSquareLogoElement>;

async function renderSvg(
    element: SatoriElement,
    fonts: { name: string; data: ArrayBuffer; weight: number; style: string }[],
): Promise<string> {
    const { width, height } = element.props.style;
    return satori(element as Parameters<typeof satori>[0], {
        width: width as number,
        height: height as number,
        fonts,
        // @ts-ignore — embedFont ensures text is self-contained
        embedFont: true,
    });
}

async function svgToPng(svg: string, targetWidth: number): Promise<Uint8Array> {
    const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: targetWidth },
    });
    return resvg.render().asPng();
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log("Loading local fonts...");
    const fontBold = await loadLocalFont("BigShouldersDisplay-ExtraBold.ttf");
    const fontMedium = await loadLocalFont("BigShouldersDisplay-Medium.ttf");

    const fonts = [
        {
            name: "Big Shoulders Display",
            data: fontBold,
            weight: 800,
            style: "normal",
        },
        {
            name: "Big Shoulders Display",
            data: fontMedium,
            weight: 500,
            style: "normal",
        },
    ];

    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Output: ${OUTPUT_DIR}\n`);

    for (const variant of logoVariants) {
        console.log(`Variant: ${variant.name}`);

        // SVG (rectangular, high-res base)
        const svgElement = buildLogoElement(variant, 800);
        const svg = await renderSvg(svgElement, fonts);
        await writeFile(join(OUTPUT_DIR, `logo-${variant.name}.svg`), svg, "utf-8");
        console.log(`  + logo-${variant.name}.svg`);

        // Rectangular PNGs
        for (const size of logoSizes.rectangular) {
            const element = buildLogoElement(variant, size * 4);
            const png = await svgToPng(await renderSvg(element, fonts), size);
            await writeFile(
                join(OUTPUT_DIR, `logo-${variant.name}-${size}.png`),
                png,
            );
            console.log(`  + logo-${variant.name}-${size}.png`);
        }

        // Square PNGs
        for (const size of logoSizes.square) {
            const element = buildSquareLogoElement(variant, size * 4);
            const png = await svgToPng(await renderSvg(element, fonts), size);
            await writeFile(
                join(OUTPUT_DIR, `logo-${variant.name}-square-${size}.png`),
                png,
            );
            console.log(`  + logo-${variant.name}-square-${size}.png`);
        }
    }

    const total =
        logoVariants.length *
        (1 + logoSizes.rectangular.length + logoSizes.square.length);
    console.log(`\nDone — ${total} files written to assets/logos/generated/`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
