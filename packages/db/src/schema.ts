import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text('text'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  display: boolean('display').notNull().default(false),
  tag_id: uuid("tag_id").references(() => tags.id, {onDelete: "cascade"})
});

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert