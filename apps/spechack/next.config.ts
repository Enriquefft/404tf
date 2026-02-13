import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	transpilePackages: ["@404tf/database", "@404tf/config"],
};

export default withNextIntl(nextConfig);
