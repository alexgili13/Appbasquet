import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  smallint,
  timestamp,
  primaryKey,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- Enums ----------

export const userRoleEnum = pgEnum("user_role", ["coach", "admin"]);

export const ageStageEnum = pgEnum("age_stage", [
  "escola",
  "premini",
  "mini",
  "infantil",
  "cadet",
  "juvenil",
  "sub23",
  "senior",
]);

export const levelEnum = pgEnum("level", ["iniciacio", "intermig", "avancat"]);

export const intensityEnum = pgEnum("intensity", ["baixa", "mitjana", "alta"]);

export const mediaTypeEnum = pgEnum("media_type", ["photo", "drawing"]);

// tsvector type per a la cerca full-text (Drizzle no el suporta nativament)
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ---------- Users ----------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("coach"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- Categories ----------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- Tags ----------

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 60 }).notNull().unique(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
});

// ---------- Exercises ----------

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Camps obligatoris
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description").notNull(),
    objective: text("objective").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    // Camps opcionals
    ageStage: ageStageEnum("age_stage"),
    level: levelEnum("level"),
    numPlayers: smallint("num_players"),
    durationMinutes: smallint("duration_minutes"),
    spaceRequired: varchar("space_required", { length: 150 }),
    material: text("material"),
    intensity: intensityEnum("intensity"),
    numBalls: smallint("num_balls"),
    instructions: text("instructions"),
    keyPoints: text("key_points"),
    commonMistakes: text("common_mistakes"),
    variants: text("variants"),
    progressions: text("progressions"),
    regressions: text("regressions"),
    videoUrl: varchar("video_url", { length: 500 }),
    notes: text("notes"),

    // Columna generada per a cerca full-text (ca simple config)
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`to_tsvector('simple',
          coalesce(${exercises.name}, '') || ' ' ||
          coalesce(${exercises.description}, '') || ' ' ||
          coalesce(${exercises.objective}, '') || ' ' ||
          coalesce(${exercises.instructions}, '')
        )`,
    ),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("exercises_search_idx").using("gin", table.searchVector),
    index("exercises_category_idx").on(table.categoryId),
    index("exercises_author_idx").on(table.authorId),
    index("exercises_age_stage_idx").on(table.ageStage),
    index("exercises_level_idx").on(table.level),
    index("exercises_intensity_idx").on(table.intensity),
    index("exercises_created_at_idx").on(table.createdAt),
  ],
);

// ---------- Exercise <-> Tags (N:M) ----------

export const exerciseTags = pgTable(
  "exercise_tags",
  {
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.exerciseId, table.tagId] }),
    index("exercise_tags_tag_idx").on(table.tagId),
  ],
);

// ---------- Media assets (fotos i dibuixos) ----------

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    blobUrl: varchar("blob_url", { length: 500 }).notNull(),
    blobPathname: varchar("blob_pathname", { length: 500 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    // Estat editable del dibuix (Fabric.js JSON), null per a fotografies
    drawingData: text("drawing_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("media_assets_exercise_idx").on(table.exerciseId)],
);

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  exercises: many(exercises),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  category: one(categories, {
    fields: [exercises.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [exercises.authorId],
    references: [users.id],
  }),
  exerciseTags: many(exerciseTags),
  media: many(mediaAssets),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  exerciseTags: many(exerciseTags),
}));

export const exerciseTagsRelations = relations(exerciseTags, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseTags.exerciseId],
    references: [exercises.id],
  }),
  tag: one(tags, {
    fields: [exerciseTags.tagId],
    references: [tags.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [mediaAssets.exerciseId],
    references: [exercises.id],
  }),
}));

// ---------- Tipus inferits ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
