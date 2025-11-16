import { pgTable, bigserial, bigint, text, timestamp } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  message_id: bigint('message_id', { mode: 'number' }).notNull(),
  user_id: bigint('user_id', { mode: 'number' }),
  username: text('username'),
  first_name: text('first_name'),
  last_name: text('last_name'),
  chat_id: bigint('chat_id', { mode: 'number' }).notNull(),
  chat_type: text('chat_type'),
  text: text('text'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

