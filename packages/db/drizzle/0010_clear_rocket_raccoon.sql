ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "holiday_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "subject_overload" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "additional_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "moderator_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "daily_salary" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD COLUMN "subject_hours_per_day" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "holiday_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "subject_overload" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "additional_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "moderator_pay" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "daily_salary" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "subject_hours_per_day" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD COLUMN "number_of_classes" integer DEFAULT 0 NOT NULL;