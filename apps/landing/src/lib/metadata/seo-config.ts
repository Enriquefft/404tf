/**
 * Central SEO configuration
 * Single source of truth for site metadata, URLs, and social links
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://404tf.com";
export const SITE_NAME = "404 Tech Found";
export const CONTACT_EMAIL = "hello@404tf.com";

export const SOCIAL_LINKS = {
	twitter: "https://x.com/TechFound404",
	linkedin: "https://linkedin.com/company/404techfound",
	instagram: "https://www.instagram.com/404techfound.latam/",
	youtube: "https://www.youtube.com/@404TF",
} as const;
