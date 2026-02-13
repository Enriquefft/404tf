import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata/seo-config";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
