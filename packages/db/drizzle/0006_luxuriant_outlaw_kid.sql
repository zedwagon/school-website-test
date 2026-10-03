CREATE TABLE "employees" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employees_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"department" "staff_department",
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP CONSTRAINT "employee_contracts_staff_id_unique";--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP CONSTRAINT "employee_contracts_staff_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_staff_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_contracts" ADD COLUMN "employee_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "payrolls" ADD COLUMN "employee_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_contracts" DROP COLUMN "staff_id";--> statement-breakpoint
ALTER TABLE "payrolls" DROP COLUMN "staff_id";--> statement-breakpoint
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_employee_id_unique" UNIQUE("employee_id");