ALTER TABLE "govt_exam_registrations" DROP CONSTRAINT "govt_exam_registrations_invoice_id_invoices_id_fk";
--> statement-breakpoint
DROP INDEX "govt_exam_registrations_invoice_id_index";--> statement-breakpoint
DROP INDEX "invoices_govt_registration_id_index";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "discount_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "converted_student_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_student_id_students_id_fk" FOREIGN KEY ("converted_student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_discount_id_index" ON "invoices" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "leads_converted_student_id_index" ON "leads" USING btree ("converted_student_id");--> statement-breakpoint
ALTER TABLE "govt_exam_registrations" DROP COLUMN "invoice_id";--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_roleId_branchId_unique" UNIQUE("user_id","role_id","branch_id");--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_courseId_branchId_mode_unique" UNIQUE("course_id","branch_id","mode");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_govtRegistrationId_unique" UNIQUE("govt_registration_id");--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_examId_enrollmentId_unique" UNIQUE("exam_id","enrollment_id");