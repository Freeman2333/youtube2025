import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const users = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),

    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (user) => [uniqueIndex("clerk_id_idx").on(user.clerkId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const categories = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (category) => [uniqueIndex("name_idx").on(category.name)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export enum MuxStatus {
  ASSET_CREATED = "asset_created",
  CANCELLED = "cancelled",
  ERRORED = "errored",
  PREPARING = "preparing",
  READY = "ready",
  TIMED_OUT = "timed_out",
  WAITING = "waiting",
}

export enum VideoVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export const muxStatusEnum = pgEnum(
  "mux_status_enum",
  Object.values(MuxStatus) as [string, ...string[]]
);

export const videoVisibilityEnum = pgEnum(
  "video_visibility_enum",
  Object.values(VideoVisibility) as [string, ...string[]]
);

export const videos = pgTable("video", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  duration: integer("duration"),

  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .$onUpdate(() => new Date()),
  muxStatus: muxStatusEnum("mux_status").notNull(),
  visibility: videoVisibilityEnum("visibility")
    .notNull()
    .default(VideoVisibility.PUBLIC),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
});

export const VideoInsertSchema = createInsertSchema(videos);
export const VideoSelectSchema = createSelectSchema(videos);
export const VideoUpdateSchema = createUpdateSchema(videos);

export const VideoInsertSchemaStrict = VideoInsertSchema.extend({
  title: VideoInsertSchema.shape.title.nonempty("Title is required"),
});

export const videosRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));
