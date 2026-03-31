import type { MaturityKey, VerticalKey } from "@/lib/verticals";

export type KeyResult = {
	type: string;
	title: string;
	description: string;
};

export type Startup = {
	slug: string;
	name: string;
	one_liner: string;
	one_liner_en: string;
	country: string;
	country_es: string;
	city: string;
	lat: number;
	lng: number;
	verticals: VerticalKey[];
	maturity_level: MaturityKey;
	founding_year: number;
	tech_description: string;
	tech_description_en: string;
	key_results: KeyResult[];
	key_results_en: KeyResult[];
	problem_statement: string;
	problem_statement_en: string;
	business_model: string;
	business_model_en: string;
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
	founder_photos: string[] | null;
	partner_logos: string[] | null;
	video_url: string | null;
	video_label: string | null;
};
