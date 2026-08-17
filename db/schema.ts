import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(), lastName: text("last_name").notNull(),
  birthYear: integer("birth_year"), deathYear: integer("death_year"), generation: integer("generation").notNull().default(0),
  branch: text("branch").notNull().default(""), relation: text("relation").notNull().default(""),
  description: text("description").notNull().default(""), story: text("story").notNull().default(""), traits: text("traits").notNull().default(""),
  healthNotes: text("health_notes").notNull().default(""), healthPrivate: integer("health_private").notNull().default(1),
  photoKey: text("photo_key"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_people_generation_birth").on(table.generation, table.birthYear)]);
