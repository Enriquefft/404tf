/**
 * Central SEO configuration
 * Single source of truth for site metadata, URLs, and social links
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://404techfound.org";
export const SITE_NAME = "404 Tech Found";
export const CONTACT_EMAIL = "hola@404techfound.com";

export const SOCIAL_LINKS = {
	twitter: "https://twitter.com/404techfound",
	linkedin: "https://linkedin.com/company/404techfound",
	instagram: "https://instagram.com/404techfound",
	youtube: "https://youtube.com/@404techfound",
} as const;
