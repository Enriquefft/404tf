import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata/seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: `${SITE_URL}/es`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
			alternates: {
				languages: {
					es: `${SITE_URL}/es`,
					en: `${SITE_URL}/en`,
				},
			},
		},
		{
			url: `${SITE_URL}/en`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
			alternates: {
				languages: {
					es: `${SITE_URL}/es`,
					en: `${SITE_URL}/en`,
				},
			},
		},
	];
}
