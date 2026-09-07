ALTER TABLE "enrollment_forms" ADD COLUMN "status_guidance_profile" json;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD COLUMN "status_guidance_needs" json;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD COLUMN "status_guidance_has_diagnosis" boolean DEFAULT false;