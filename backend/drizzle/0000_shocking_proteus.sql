CREATE SCHEMA "constituents";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "constituents"."constituent_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"constituent_id" integer,
	"issue_id" integer,
	"priority" integer,
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "constituents"."constituents" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"sign_up_time" timestamp DEFAULT now() NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL,
	"active" integer DEFAULT 0 NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"date_of_birth" timestamp,
	"preferred_contact_method" text,
	"last_contact_date" timestamp,
	"notes" text,
	"tags" text[],
	CONSTRAINT "constituents_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "constituents"."issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "constituents"."constituent_issues" ADD CONSTRAINT "constituent_issues_constituent_id_constituents_id_fk" FOREIGN KEY ("constituent_id") REFERENCES "constituents"."constituents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "constituents"."constituent_issues" ADD CONSTRAINT "constituent_issues_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "constituents"."issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
