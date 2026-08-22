CREATE TABLE "payouts" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"user_id" varchar(8) NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"reference_id" varchar(8),
	"level" numeric(2, 0),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"month" varchar(7)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"parent_id" varchar(8),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"investment" numeric(15, 2) DEFAULT '0' NOT NULL,
	"investment_date" timestamp,
	"investment_tier" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
