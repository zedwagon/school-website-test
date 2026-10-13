CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."grade_level" AS ENUM('nursery', 'kinder_1', 'kinder_2', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12');--> statement-breakpoint
CREATE TYPE "public"."learner_type" AS ENUM('elementary', 'junior_high', 'senior_high');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'full_payment', 'down_payment', 'insufficient');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'staff', 'admin');--> statement-breakpoint
CREATE TYPE "public"."shs_track" AS ENUM('academic', 'tech_pro');--> statement-breakpoint
CREATE TYPE "public"."staff_department" AS ENUM('registrar', 'clinic', 'guidance', 'accounting', 'faculty', 'admin');--> statement-breakpoint
CREATE TYPE "public"."student_type" AS ENUM('new', 'transferee', 'returning', 'old');--> statement-breakpoint
CREATE TABLE "school_years" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "school_years_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subjects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"student_id" integer NOT NULL,
	"subject_id" integer,
	"section_id" integer NOT NULL,
	"school_year_id" integer NOT NULL,
	"grade" numeric(5, 2),
	"is_general_average" boolean DEFAULT false NOT NULL,
	"remarks" text,
	"encoded_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "class_schedules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"section_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"teacher_id" integer,
	"day_of_week" "day_of_week",
	"start_time" time,
	"end_time" time,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "section_rosters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "section_rosters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"enrollment_id" integer NOT NULL,
	"section_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"grade_level" "grade_level" NOT NULL,
	"school_year_id" integer NOT NULL,
	"adviser_id" integer,
	"room" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "enrollment_forms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enrollment_forms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"student_id" integer NOT NULL,
	"school_year_id" integer NOT NULL,
	"student_type" "student_type" NOT NULL,
	"is_enrolled" boolean DEFAULT false NOT NULL,
	"status_note" text,
	"grade_level" "grade_level" NOT NULL,
	"shs_track" "shs_track",
	"learner_type" "learner_type" NOT NULL,
	"guardian_name" varchar(255),
	"guardian_contact" varchar(50),
	"guardian_relationship" varchar(100),
	"last_grade_level_completed" varchar(100),
	"last_school_year_completed" varchar(50),
	"last_school_name" varchar(255),
	"last_school_id" varchar(50),
	"last_school_address" text,
	"is_esc" boolean DEFAULT false NOT NULL,
	"esc_number" varchar(50),
	"is_shs_voucher" boolean DEFAULT false NOT NULL,
	"assisted_by_id" integer,
	"assisted_at" timestamp,
	"status_clinic_done" boolean DEFAULT false NOT NULL,
	"status_clinic_finished_at" timestamp,
	"status_clinic_note" text,
	"status_clinic_medical_history" json,
	"status_guidance_done" boolean DEFAULT false NOT NULL,
	"status_guidance_finished_at" timestamp,
	"status_guidance_note" text,
	"status_accounting_done" boolean DEFAULT false NOT NULL,
	"status_accounting_finished_at" timestamp,
	"status_accounting_note" text,
	"status_accounting_si_number" text,
	"status_accounting_payment_type" "payment_status" DEFAULT 'pending' NOT NULL,
	"status_clinic_approved_by_id" integer,
	"status_guidance_approved_by_id" integer,
	"status_accounting_approved_by_id" integer,
	"status_registrar_approved_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "students_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"lrn" varchar(12),
	"psa_birth_cert_no" varchar(50),
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"suffix" varchar(20),
	"birthdate" date NOT NULL,
	"gender" "gender" NOT NULL,
	"address" text,
	"zip_code" varchar(10),
	"parent_father_name" varchar(255),
	"parent_mother_maiden_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "students_lrn_unique" UNIQUE("lrn")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contacts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "staff_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"department" "staff_department",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "staff_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_encoded_by_id_users_id_fk" FOREIGN KEY ("encoded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_teacher_id_staff_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_rosters" ADD CONSTRAINT "section_rosters_enrollment_id_enrollment_forms_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_rosters" ADD CONSTRAINT "section_rosters_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_adviser_id_staff_id_fk" FOREIGN KEY ("adviser_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_assisted_by_id_users_id_fk" FOREIGN KEY ("assisted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_status_clinic_approved_by_id_users_id_fk" FOREIGN KEY ("status_clinic_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_status_guidance_approved_by_id_users_id_fk" FOREIGN KEY ("status_guidance_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_status_accounting_approved_by_id_users_id_fk" FOREIGN KEY ("status_accounting_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_forms" ADD CONSTRAINT "enrollment_forms_status_registrar_approved_by_id_users_id_fk" FOREIGN KEY ("status_registrar_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;