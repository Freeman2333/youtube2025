import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  primaryKey,
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
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  subscriptions: many(subscriptions, {
    relationName: "viewer",
  }),
  subscribers: many(subscriptions, {
    relationName: "creator",
  }),
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
  thumbnailKey: text("thumbnail_key"),
  thumbnailUrl: text("thumbnail_url"),
  previewKey: text("preview_key"),
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

export const videosRelations = relations(videos, ({ many, one }) => ({
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
}));

export const videoViews = pgTable(
  "video_view",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (videoView) => [
    primaryKey({
      name: "video_views_pk",
      columns: [videoView.userId, videoView.videoId],
    }),
  ]
);

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  users: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export enum ReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
}

export const reactionTypeEnum = pgEnum(
  "reaction_type_enum",
  Object.values(ReactionType) as [string, ...string[]]
);

export const videoReactions = pgTable(
  "video_reaction",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (videoReaction) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [videoReaction.userId, videoReaction.videoId],
    }),
  ]
);

export const videoReactionsRelations = relations(videoReactions, ({ one }) => ({
  users: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (subscription) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [subscription.viewerId, subscription.creatorId],
    }),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
  }),
}));
