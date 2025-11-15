import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import { messages } from 'db';

const app = new Hono();

app.use('/*', cors());

app.get('/api/messages', async (c) => {
  try {
    const result = await db.select().from(messages);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

