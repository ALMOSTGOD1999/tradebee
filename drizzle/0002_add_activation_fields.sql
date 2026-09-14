ALTER TABLE "users" ADD COLUMN "activation_package" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_proof" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "activation_status" varchar(10);