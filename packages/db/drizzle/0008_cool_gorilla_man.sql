CREATE SCHEMA "accounting";
--> statement-breakpoint
CREATE TYPE "public"."employee_type" AS ENUM('part_time_teaching', 'non_teaching', 'teaching', 'administrators');--> statement-breakpoint
CREATE TABLE "accounting"."employee_contracts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."employee_contracts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"employee_id" integer NOT NULL,
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
	CONSTRAINT "employee_contracts_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "accounting"."employees" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."employees_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"type" "employee_type" NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "accounting"."payroll_periods" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."payroll_periods_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "accounting"."payrolls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounting"."payrolls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"period_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
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
ALTER TABLE "employee_contracts" DROP CONSTRAINT "employee_contracts_employee_id_unique";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP CONSTRAINT "employee_contracts_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_period_id_payroll_periods_id_fk";
--> statement-breakpoint
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_employee_id_employees_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'employee_contracts'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "employee_contracts" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "employee_contracts" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'employees'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "employees" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'payroll_periods'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "payroll_periods" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "payroll_periods" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'payrolls'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "payrolls" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "payrolls" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "accounting"."employee_contracts" ADD CONSTRAINT "employee_contracts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "accounting"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting"."employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD CONSTRAINT "payrolls_period_id_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "accounting"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting"."payrolls" ADD CONSTRAINT "payrolls_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "accounting"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "employee_id";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "base_salary";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "transpo_allowance";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "position_pay";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "advisory_pay";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "sss_ee";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "sss_er";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "philhealth_ee";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "philhealth_er";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "pag_ibig_ee";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "pag_ibig_er";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "middle_name";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "payroll_periods" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "period_id";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "employee_id";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "base_salary";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "half_salary";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "transpo_allowance";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "position_pay";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "advisory_pay";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "total_earnings";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "sss_ee";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "sss_er";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "philhealth_ee";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "philhealth_er";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "pag_ibig_ee";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "pag_ibig_er";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "loan_deduction";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "total_deductions";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "net_pay";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "created_at";