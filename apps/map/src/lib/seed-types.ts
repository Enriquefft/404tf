/** Type definition for a startup entry in seed.json. */
export type SeedStartup = {
	slug: string;
	name: string;
	one_liner: string;
	one_liner_en: string | null;
	country: string;
	country_es: string;
	city: string;
	lat: number;
	lng: number;
	verticals: string[];
	maturity_level: string;
	founding_year: number;
	tech_description: string | null;
	tech_description_en: string | null;
	key_results: KeyResult[] | null;
	key_results_en: KeyResult[] | null;
	problem_statement: string | null;
	problem_statement_en: string | null;
	business_model: string | null;
	business_model_en: string | null;
	funding_received: string | null;
	team_size: number | null;
	website_url: string | null;
	social_links: Record<string, string> | null;
	contact_name: string | null;
	contact_role: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	contact_linkedin: string | null;
	claimed: boolean;
	logo_path: string | null;
	hero_image_path: string | null;
	founder_photos: FounderPhoto[] | null;
	partner_logos: string[] | null;
	video_url: string | null;
	video_label: string | null;
};

export type KeyResult = {
	type: string;
	title: string;
	description: string;
	partner?: string;
};

export type FounderPhoto = {
	image_path: string;
	name: string;
	role: string;
	linkedin_url?: string;
};
