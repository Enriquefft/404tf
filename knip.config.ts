import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: ["packages/*/src/index.ts"],
		},
		"apps/landing": {
			entry: ["src/app/**/*", "src/i18n/request.ts"],
			ignore: ["src/components/ui/**/*"],
			paths: {
				"@/*": ["./src/*"],
			},
		},
"packages/brand": {
			entry: ["src/index.ts"],
		},
	},
	compilers: {
		css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
	},
};

export default config;
