ALTER TABLE "affiliation_bodies" DROP CONSTRAINT "affiliation_bodies_code_unique";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_code_unique";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_slug_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_govtRegistrationId_unique";--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_employeeCode_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";--> statement-breakpoint
ALTER TABLE "branches" DROP CONSTRAINT "branches_code_unique";--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_studentCode_unique";--> statement-breakpoint
ALTER TABLE "batches" DROP CONSTRAINT "batches_code_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "affiliationBodies_code_live_uq" ON "affiliation_bodies" USING btree ("code") WHERE "affiliation_bodies"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_code_live_uq" ON "courses" USING btree ("code") WHERE "courses"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_slug_live_uq" ON "courses" USING btree ("slug") WHERE "courses"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_govtRegistrationId_live_uq" ON "invoices" USING btree ("govt_registration_id") WHERE "invoices"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "employees_employeeCode_live_uq" ON "employees" USING btree ("employee_code") WHERE "employees"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_live_uq" ON "users" USING btree ("email") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_live_uq" ON "users" USING btree ("phone") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "branches_code_live_uq" ON "branches" USING btree ("code") WHERE "branches"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "students_studentCode_live_uq" ON "students" USING btree ("student_code") WHERE "students"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "batches_code_live_uq" ON "batches" USING btree ("code") WHERE "batches"."deleted_at" IS NULL;