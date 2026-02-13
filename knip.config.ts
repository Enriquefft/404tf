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
		"apps/spechack": {
			entry: ["src/app/**/*"],
			paths: {
				"@/*": ["./src/*"],
			},
		},
	},
	compilers: {
		css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
	},
};

export default config;
