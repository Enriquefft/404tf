CREATE INDEX "idx_map_corp_leads_email" ON "404tf"."map_corporate_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_map_corp_leads_created" ON "404tf"."map_corporate_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_map_downloads_email" ON "404tf"."map_report_downloads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_map_downloads_created" ON "404tf"."map_report_downloads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_map_apps_email" ON "404tf"."map_startup_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_map_apps_created" ON "404tf"."map_startup_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_map_prog_inq_email" ON "404tf"."map_startup_program_inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_map_prog_inq_created" ON "404tf"."map_startup_program_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_map_startups_country" ON "404tf"."map_startups" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_map_startups_maturity" ON "404tf"."map_startups" USING btree ("maturity_level");--> statement-breakpoint
CREATE INDEX "idx_map_startups_created" ON "404tf"."map_startups" USING btree ("created_at");