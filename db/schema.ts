import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(), lastName: text("last_name").notNull(),
  birthYear: integer("birth_year"), deathYear: integer("death_year"), generation: integer("generation").notNull().default(0),
  branch: text("branch").notNull().default(""), relation: text("relation").notNull().default(""),
  description: text("description").notNull().default(""), story: text("story").notNull().default(""), traits: text("traits").notNull().default(""),
  healthNotes: text("health_notes").notNull().default(""), healthPrivate: integer("health_private").notNull().default(1),
  photoKey: text("photo_key"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_people_generation_birth").on(table.generation, table.birthYear)]);

export const relationships = sqliteTable("relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  relatedPersonId: integer("related_person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["parent", "partner"] }).notNull(),
  story: text("story").notNull().default(""),
  eventLabel: text("event_label").notNull().default(""),
  eventDate: text("event_date").notNull().default(""),
  place: text("place").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_relationships_unique").on(table.personId, table.relatedPersonId, table.type),
  index("idx_relationships_related").on(table.relatedPersonId, table.type),
]);

export const personFields = sqliteTable("person_fields", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  position: integer("position").notNull().default(0),
}, (table) => [index("idx_person_fields_person_position").on(table.personId, table.position)]);

export const familySettings = sqliteTable("family_settings", {
  id: integer("id").primaryKey(),
  backgroundKey: text("background_key"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const familyMedia = sqliteTable("family_media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  photoKey: text("photo_key").notNull(), caption: text("caption").notNull().default(""), eventDate: text("event_date").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_family_media_person_date").on(table.personId, table.eventDate)]);
