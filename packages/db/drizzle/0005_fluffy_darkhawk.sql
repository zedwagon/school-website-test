CREATE TABLE "employee_contracts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_contracts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"staff_id" integer NOT NULL,
	"base_salary" numeric(10, 2) DEFAULT '0' NOT NULL,
	"transpo_allowance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"position_pay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"advisory_pay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sss_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sss_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"philhealth_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"philhealth_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pag_ibig_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pag_ibig_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "employee_contracts_staff_id_unique" UNIQUE("staff_id")
);
--> statement-breakpoint
CREATE TABLE "payroll_periods" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payroll_periods_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payrolls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payrolls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"period_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"base_salary" numeric(10, 2) DEFAULT '0' NOT NULL,
	"half_salary" numeric(10, 2) DEFAULT '0' NOT NULL,
	"transpo_allowance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"position_pay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"advisory_pay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_earnings" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sss_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sss_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"philhealth_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"philhealth_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pag_ibig_ee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pag_ibig_er" numeric(10, 2) DEFAULT '0' NOT NULL,
	"loan_deduction" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_deductions" numeric(10, 2) DEFAULT '0' NOT NULL,
	"net_pay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_period_id_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;