CREATE TYPE "404tf"."map_edit_status" AS ENUM('published', 'pending_review', 'changes_requested');--> statement-breakpoint
CREATE TYPE "404tf"."map_maturity" AS ENUM('rd', 'prototype', 'pilot', 'revenue');--> statement-breakpoint
CREATE TYPE "404tf"."map_vertical" AS ENUM('ai_ml', 'biotech', 'hardware_robotics', 'cleantech', 'agritech', 'healthtech', 'advanced_materials', 'aerospace', 'quantum', 'other');--> statement-breakpoint
CREATE TABLE "404tf"."map_corporate_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"role" text,
	"industry" text,
	"challenge" text,
	"timeline" text,
	"notes" text,
	"context_startup_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "404tf"."map_report_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "404tf"."map_startup_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_name" text NOT NULL,
	"website" text,
	"contact_name" text NOT NULL,
	"contact_role" text,
	"email" text NOT NULL,
	"country" text,
	"vertical" text,
	"maturity" text,
	"one_liner" text,
	"pitch" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "404tf"."map_startup_program_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"tier_interest" text,
	"description" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "404tf"."map_startups" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"one_liner" text,
	"one_liner_en" text,
	"tech_description" text,
	"tech_description_en" text,
	"key_results" jsonb,
	"key_results_en" jsonb,
	"problem_statement" text,
	"problem_statement_en" text,
	"business_model" text,
	"business_model_en" text,
	"country" text NOT NULL,
	"country_es" text,
	"city" text NOT NULL,
	"lat" real,
	"lng" real,
	"verticals" text[],
	"maturity_level" "404tf"."map_maturity",
	"founding_year" integer,
	"funding_received" text,
	"team_size" integer,
	"website_url" text,
	"social_links" jsonb,
	"logo_path" text,
	"hero_image_path" text,
	"founder_photos" jsonb,
	"partner_logos" text[],
	"video_url" text,
	"video_label" text,
	"contact_name" text,
	"contact_role" text,
	"contact_email" text,
	"contact_phone" text,
	"contact_linkedin" text,
	"support_needed" text,
	"claimed" boolean DEFAULT false,
	"claimed_by_email" text,
	"claim_approved" boolean DEFAULT false,
	"last_edited_at" timestamp with time zone,
	"edit_status" "404tf"."map_edit_status" DEFAULT 'published',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_startups_slug_unique" UNIQUE("slug")
);
