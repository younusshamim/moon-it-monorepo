CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'invited');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('onsite', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_type" AS ENUM('short_course', 'language', 'diploma');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('planned', 'open_for_enrollment', 'running', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'on_leave', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."govt_reg_status" AS ENUM('pending_payment', 'registered', 'admit_issued', 'appeared', 'passed', 'failed', 'absent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('applied', 'confirmed', 'active', 'completed', 'dropped', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."invoice_purpose" AS ENUM('course_fee', 'govt_exam_fee');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'issued', 'partially_paid', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."certificate_source" AS ENUM('institute', 'government');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('quiz', 'midterm', 'final', 'practical', 'assignment');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('walk_in', 'facebook', 'google', 'referral', 'phone', 'website');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'interested', 'enrolled', 'lost');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" varchar(160) NOT NULL,
	"address_line1" varchar(240),
	"address_line2" varchar(240),
	"city" varchar(80),
	"phone" varchar(32),
	"email" varchar(160),
	"timezone" varchar(64) DEFAULT 'Asia/Dhaka' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"capacity" integer NOT NULL,
	"has_computers" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(80) NOT NULL,
	"description" varchar(200),
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(48) NOT NULL,
	"name" varchar(80) NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"branch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(160) NOT NULL,
	"phone" varchar(32),
	"password_hash" varchar(255),
	"full_name" varchar(160) NOT NULL,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "course_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"mode" "delivery_mode" DEFAULT 'onsite' NOT NULL,
	"base_fee" numeric(12, 2) NOT NULL,
	"admission_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid,
	"type" "program_type" NOT NULL,
	"code" varchar(24) NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text,
	"duration_weeks" integer,
	"duration_months" integer,
	"total_hours" integer,
	"level" varchar(40),
	"default_mode" "delivery_mode" DEFAULT 'onsite' NOT NULL,
	"is_govt_affiliated" boolean DEFAULT false NOT NULL,
	"affiliation_body_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "courses_code_unique" UNIQUE("code"),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"order_index" integer NOT NULL,
	"duration_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "batch_instructors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"instructor_id" uuid NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"room_id" uuid
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(120),
	"status" "batch_status" DEFAULT 'planned' NOT NULL,
	"start_date" date,
	"end_date" date,
	"capacity" integer NOT NULL,
	"enrolled_count" integer DEFAULT 0 NOT NULL,
	"fee_override" numeric(12, 2),
	"default_room_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "batches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"instructor_id" uuid,
	"room_id" uuid,
	"session_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"topic" varchar(200),
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"home_branch_id" uuid NOT NULL,
	"student_code" varchar(24) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(160),
	"gender" "gender",
	"date_of_birth" date,
	"nid_or_birth_cert" varchar(40),
	"guardian_name" varchar(160),
	"guardian_phone" varchar(32),
	"address" text,
	"photo_url" varchar(400),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "students_studentCode_unique" UNIQUE("student_code")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"branch_id" uuid NOT NULL,
	"employee_code" varchar(24) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"designation" varchar(80),
	"phone" varchar(32),
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"joined_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "employees_employeeCode_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"user_id" uuid,
	"full_name" varchar(160) NOT NULL,
	"expertise" jsonb,
	"bio" varchar(600),
	"rate_per_session" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "affiliation_bodies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(24) NOT NULL,
	"name" varchar(200) NOT NULL,
	"website" varchar(240),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "affiliation_bodies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "govt_exam_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliation_body_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"exam_date" date,
	"registration_opens_at" date,
	"registration_closes_at" date,
	"result_published_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "govt_exam_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"branch_id" uuid,
	"registration_fee" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "govt_exam_fees_courseId_branchId_unique" UNIQUE("course_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "govt_exam_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"exam_event_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"status" "govt_reg_status" DEFAULT 'pending_payment' NOT NULL,
	"invoice_id" uuid,
	"board_roll_number" varchar(48),
	"board_registration_number" varchar(48),
	"result_grade" varchar(16),
	"result_marks" numeric(6, 2),
	"registered_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "govt_exam_registrations_studentId_examEventId_unique" UNIQUE("student_id","exam_event_id")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"marked_by" uuid,
	CONSTRAINT "attendance_sessionId_enrollmentId_unique" UNIQUE("session_id","enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'applied' NOT NULL,
	"enrolled_at" date,
	"completed_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "enrollments_studentId_batchId_unique" UNIQUE("student_id","batch_id")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid,
	"code" varchar(32),
	"name" varchar(120) NOT NULL,
	"type" "discount_type" NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"valid_from" date,
	"valid_to" date,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount_due" numeric(12, 2) NOT NULL,
	"amount_paid" numeric(12, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" varchar(200) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"invoice_number" varchar(32) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"purpose" "invoice_purpose" DEFAULT 'course_fee' NOT NULL,
	"govt_registration_id" uuid,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"discount_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(12, 2) NOT NULL,
	"amount_paid" numeric(12, 2) DEFAULT '0' NOT NULL,
	"due_date" date,
	"issued_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"installment_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"invoice_id" uuid,
	"student_id" uuid NOT NULL,
	"receipt_number" varchar(32) NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'succeeded' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reference" varchar(120),
	"paid_at" date,
	"received_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "payments_receiptNumber_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"source" "certificate_source" DEFAULT 'institute' NOT NULL,
	"govt_registration_id" uuid,
	"affiliation_body_id" uuid,
	"certificate_number" varchar(40) NOT NULL,
	"issued_at" date NOT NULL,
	"final_grade" varchar(8),
	"verification_code" varchar(64),
	"pdf_url" varchar(400),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "certificates_certificateNumber_unique" UNIQUE("certificate_number"),
	CONSTRAINT "certificates_verificationCode_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"type" "exam_type" NOT NULL,
	"title" varchar(160) NOT NULL,
	"total_marks" numeric(6, 2) NOT NULL,
	"pass_marks" numeric(6, 2) NOT NULL,
	"weight" numeric(5, 2) DEFAULT '1' NOT NULL,
	"exam_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"marks_obtained" numeric(6, 2),
	"letter_grade" varchar(4),
	"remarks" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" varchar(40) NOT NULL,
	"note" text,
	"activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"by" uuid
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(160),
	"interested_course_id" uuid,
	"source" "lead_source" DEFAULT 'walk_in' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_to" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"branch_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_user_id" uuid,
	"channel" varchar(16) NOT NULL,
	"title" varchar(200),
	"body" text,
	"read_at" timestamp with time zone,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_affiliation_body_id_affiliation_bodies_id_fk" FOREIGN KEY ("affiliation_body_id") REFERENCES "public"."affiliation_bodies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_instructors" ADD CONSTRAINT "batch_instructors_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_instructors" ADD CONSTRAINT "batch_instructors_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_schedules" ADD CONSTRAINT "batch_schedules_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_schedules" ADD CONSTRAINT "batch_schedules_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."course_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_default_room_id_rooms_id_fk" FOREIGN KEY ("default_room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_home_branch_id_branches_id_fk" FOREIGN KEY ("home_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_events" ADD CONSTRAINT "govt_exam_events_affiliation_body_id_affiliation_bodies_id_fk" FOREIGN KEY ("affiliation_body_id") REFERENCES "public"."affiliation_bodies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_events" ADD CONSTRAINT "govt_exam_events_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_fees" ADD CONSTRAINT "govt_exam_fees_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_fees" ADD CONSTRAINT "govt_exam_fees_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" ADD CONSTRAINT "govt_exam_registrations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" ADD CONSTRAINT "govt_exam_registrations_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" ADD CONSTRAINT "govt_exam_registrations_exam_event_id_govt_exam_events_id_fk" FOREIGN KEY ("exam_event_id") REFERENCES "public"."govt_exam_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" ADD CONSTRAINT "govt_exam_registrations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" ADD CONSTRAINT "govt_exam_registrations_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_govt_registration_id_govt_exam_registrations_id_fk" FOREIGN KEY ("govt_registration_id") REFERENCES "public"."govt_exam_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_installment_id_installments_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."installments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_govt_registration_id_govt_exam_registrations_id_fk" FOREIGN KEY ("govt_registration_id") REFERENCES "public"."govt_exam_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_affiliation_body_id_affiliation_bodies_id_fk" FOREIGN KEY ("affiliation_body_id") REFERENCES "public"."affiliation_bodies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_interested_course_id_courses_id_fk" FOREIGN KEY ("interested_course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "departments_branch_id_index" ON "departments" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "departments_created_at_index" ON "departments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rooms_branch_id_index" ON "rooms" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "rooms_created_at_index" ON "rooms" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_index" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_index" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_index" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_branch_id_index" ON "user_roles" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "user_roles_created_at_index" ON "user_roles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_created_at_index" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "course_modules_course_id_index" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_modules_created_at_index" ON "course_modules" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "course_offerings_course_id_index" ON "course_offerings" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_offerings_branch_id_index" ON "course_offerings" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "course_offerings_created_at_index" ON "course_offerings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "courses_department_id_index" ON "courses" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "courses_affiliation_body_id_index" ON "courses" USING btree ("affiliation_body_id");--> statement-breakpoint
CREATE INDEX "courses_created_at_index" ON "courses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lessons_module_id_index" ON "lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "batch_instructors_batch_id_index" ON "batch_instructors" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "batch_instructors_instructor_id_index" ON "batch_instructors" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "batch_schedules_batch_id_index" ON "batch_schedules" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "batch_schedules_room_id_index" ON "batch_schedules" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "batches_offering_id_index" ON "batches" USING btree ("offering_id");--> statement-breakpoint
CREATE INDEX "batches_branch_id_index" ON "batches" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "batches_default_room_id_index" ON "batches" USING btree ("default_room_id");--> statement-breakpoint
CREATE INDEX "batches_created_at_index" ON "batches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_batch_id_index" ON "sessions" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "sessions_instructor_id_index" ON "sessions" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "sessions_room_id_index" ON "sessions" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "sessions_session_date_index" ON "sessions" USING btree ("session_date");--> statement-breakpoint
CREATE INDEX "sessions_created_at_index" ON "sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "students_user_id_index" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "students_home_branch_id_index" ON "students" USING btree ("home_branch_id");--> statement-breakpoint
CREATE INDEX "students_created_at_index" ON "students" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "employees_user_id_index" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employees_branch_id_index" ON "employees" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "employees_created_at_index" ON "employees" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "instructors_employee_id_index" ON "instructors" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "instructors_user_id_index" ON "instructors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "instructors_created_at_index" ON "instructors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliation_bodies_created_at_index" ON "affiliation_bodies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "govt_exam_events_affiliation_body_id_index" ON "govt_exam_events" USING btree ("affiliation_body_id");--> statement-breakpoint
CREATE INDEX "govt_exam_events_course_id_index" ON "govt_exam_events" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "govt_exam_events_created_at_index" ON "govt_exam_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "govt_exam_fees_course_id_index" ON "govt_exam_fees" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "govt_exam_fees_branch_id_index" ON "govt_exam_fees" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "govt_exam_fees_created_at_index" ON "govt_exam_fees" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_student_id_index" ON "govt_exam_registrations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_enrollment_id_index" ON "govt_exam_registrations" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_exam_event_id_index" ON "govt_exam_registrations" USING btree ("exam_event_id");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_branch_id_index" ON "govt_exam_registrations" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_invoice_id_index" ON "govt_exam_registrations" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "govt_exam_registrations_created_at_index" ON "govt_exam_registrations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "attendance_session_id_index" ON "attendance" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "attendance_enrollment_id_index" ON "attendance" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "enrollments_student_id_index" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollments_batch_id_index" ON "enrollments" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "enrollments_created_at_index" ON "enrollments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "discounts_branch_id_index" ON "discounts" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "installments_invoice_id_index" ON "installments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_lines_invoice_id_index" ON "invoice_lines" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoices_branch_id_index" ON "invoices" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "invoices_student_id_index" ON "invoices" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "invoices_enrollment_id_index" ON "invoices" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "invoices_govt_registration_id_index" ON "invoices" USING btree ("govt_registration_id");--> statement-breakpoint
CREATE INDEX "invoices_created_at_index" ON "invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_allocations_payment_id_index" ON "payment_allocations" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_allocations_installment_id_index" ON "payment_allocations" USING btree ("installment_id");--> statement-breakpoint
CREATE INDEX "payments_branch_id_index" ON "payments" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_id_index" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_student_id_index" ON "payments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "payments_created_at_index" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "refunds_payment_id_index" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "refunds_created_at_index" ON "refunds" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "certificates_enrollment_id_index" ON "certificates" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "certificates_course_id_index" ON "certificates" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "certificates_govt_registration_id_index" ON "certificates" USING btree ("govt_registration_id");--> statement-breakpoint
CREATE INDEX "certificates_affiliation_body_id_index" ON "certificates" USING btree ("affiliation_body_id");--> statement-breakpoint
CREATE INDEX "certificates_created_at_index" ON "certificates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exams_batch_id_index" ON "exams" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "exams_created_at_index" ON "exams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "grades_exam_id_index" ON "grades" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "grades_enrollment_id_index" ON "grades" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "grades_created_at_index" ON "grades" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lead_activities_lead_id_index" ON "lead_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "leads_branch_id_index" ON "leads" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "leads_interested_course_id_index" ON "leads" USING btree ("interested_course_id");--> statement-breakpoint
CREATE INDEX "leads_created_at_index" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_user_id_index" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_branch_id_index" ON "audit_logs" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_index" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_index" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_recipient_user_id_index" ON "notifications" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "notifications_sent_at_index" ON "notifications" USING btree ("sent_at");