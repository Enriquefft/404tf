import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["src/app/**/*", "src/env/**/*", "src/i18n/request.ts"],
	ignore: ["src/components/ui/**/*"],
	ignoreDependencies: [],
	paths: {
		"@/*": ["./src/*"],
	},
	compilers: {
		css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
	},
};

export default config;
