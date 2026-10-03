CREATE TABLE "accounting"."employee_loan_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."employee_loan_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"loan_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date_paid" timestamp NOT NULL,
	"reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounting"."employee_loans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."employee_loans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"employee_id" integer NOT NULL,
	"principal_amount" numeric(10, 2) NOT NULL,
	"monthly_deduction" numeric(10, 2) NOT NULL,
	"date_issued" timestamp NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounting"."employee_loan_payments" ADD CONSTRAINT "employee_loan_payments_loan_id_employee_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "accounting"."employee_loans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting"."employee_loans" ADD CONSTRAINT "employee_loans_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "accounting"."employees"("id") ON DELETE no action ON UPDATE no action;