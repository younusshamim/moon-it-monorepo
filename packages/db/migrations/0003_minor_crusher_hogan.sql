CREATE TABLE "course_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(24),
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "course_variants_courseId_name_unique" UNIQUE("course_id","name"),
	CONSTRAINT "course_variants_courseId_id_unique" UNIQUE("course_id","id")
);
--> statement-breakpoint
ALTER TABLE "course_offerings" DROP CONSTRAINT "course_offerings_courseId_branchId_mode_unique";--> statement-breakpoint
ALTER TABLE "course_offerings" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "course_variants" ADD CONSTRAINT "course_variants_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_variants_course_id_index" ON "course_variants" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_variants_created_at_index" ON "course_variants" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_course_id_variant_id_course_variants_course_id_id_fk" FOREIGN KEY ("course_id","variant_id") REFERENCES "public"."course_variants"("course_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_offerings_variant_id_index" ON "course_offerings" USING btree ("variant_id");--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_courseId_branchId_mode_variantId_unique" UNIQUE NULLS NOT DISTINCT("course_id","branch_id","mode","variant_id");