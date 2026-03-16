CREATE SCHEMA "404tf";
--> statement-breakpoint
CREATE TYPE "404tf"."landing_intent" AS ENUM('build', 'collaborate', 'connect');--> statement-breakpoint
CREATE TYPE "404tf"."landing_locale" AS ENUM('es', 'en');--> statement-breakpoint
CREATE TABLE "404tf"."intent_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent" "404tf"."landing_intent" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"locale" "404tf"."landing_locale" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
