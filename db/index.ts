import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export async function ensureDb() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS people (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      first_name text NOT NULL, last_name text NOT NULL,
      birth_year integer, death_year integer, generation integer DEFAULT 0 NOT NULL,
      branch text DEFAULT '' NOT NULL, relation text DEFAULT '' NOT NULL,
      description text DEFAULT '' NOT NULL, story text DEFAULT '' NOT NULL,
      traits text DEFAULT '' NOT NULL, health_notes text DEFAULT '' NOT NULL,
      health_private integer DEFAULT 1 NOT NULL, photo_key text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_people_generation_birth ON people (generation, birth_year)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS relationships (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      person_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      related_person_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      type text NOT NULL CHECK(type IN ('parent','partner')),
      story text DEFAULT '' NOT NULL, event_label text DEFAULT '' NOT NULL,
      event_date text DEFAULT '' NOT NULL, place text DEFAULT '' NOT NULL,
      source_url text DEFAULT '' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_relationships_unique ON relationships (person_id, related_person_id, type)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_relationships_related ON relationships (related_person_id, type)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS person_fields (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      person_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      label text NOT NULL, value text NOT NULL, position integer DEFAULT 0 NOT NULL
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_person_fields_person_position ON person_fields (person_id, position)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS family_settings (id integer PRIMARY KEY NOT NULL, background_key text, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS family_media (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, person_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE, photo_key text NOT NULL, caption text DEFAULT '' NOT NULL, event_date text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_family_media_person_date ON family_media (person_id, event_date)"),
    env.DB.prepare("PRAGMA optimize"),
  ]);
  return getDb();
}
