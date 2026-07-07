ALTER TABLE "users" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "updated_by" uuid;