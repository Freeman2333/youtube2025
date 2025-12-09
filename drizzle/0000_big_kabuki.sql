CREATE TYPE "public"."mux_status_enum" AS ENUM('asset_created', 'cancelled', 'errored', 'preparing', 'ready', 'timed_out', 'waiting');--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category_id" uuid,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"mux_status" "mux_status_enum" NOT NULL,
	"mux_asset_id" text,
	"mux_upload_id" text,
	"mux_playback_id" text,
	"mux_track_id" text,
	"mux_track_status" text,
	CONSTRAINT "video_mux_asset_id_unique" UNIQUE("mux_asset_id"),
	CONSTRAINT "video_mux_upload_id_unique" UNIQUE("mux_upload_id"),
	CONSTRAINT "video_mux_playback_id_unique" UNIQUE("mux_playback_id"),
	CONSTRAINT "video_mux_track_id_unique" UNIQUE("mux_track_id")
);
--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "name_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "clerk_id_idx" ON "user" USING btree ("clerk_id");