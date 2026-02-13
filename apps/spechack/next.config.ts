import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@404tf/database", "@404tf/config"],
};

export default nextConfig;
