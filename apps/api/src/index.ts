import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/types';
import { db } from './db';
import { messages } from 'db/schema';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();
const usePolling = !process.env.VERCEL;

// Configure CORS with allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use('/*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Initialize Telegraf bot (only if BOT_TOKEN is set)
let bot: Telegraf | null = null;
if (process.env.BOT_TOKEN) {
  bot = new Telegraf(process.env.BOT_TOKEN);
  
  // Log message to database
  async function logMessage(ctx: Context): Promise<void> {
    try {
      const message = ctx.message;
      if (!message || !('text' in message)) return;

      const logEntry = {
        message_id: message.message_id,
        user_id: message.from?.id || null,
        username: message.from?.username || null,
        first_name: message.from?.first_name || null,
        last_name: message.from?.last_name || null,
        chat_id: message.chat.id,
        chat_type: message.chat.type,
        text: message.text || null,
        timestamp: new Date(message.date * 1000),
      };

      await db.insert(messages).values(logEntry);
      console.log(`Logged message ${message.message_id} from user ${message.from?.id}`);
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }

  // Handle all messages
  bot.on('message', async (ctx) => {
    await logMessage(ctx);
  });

  // Handle errors
  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
  });

  if (usePolling) {
    bot.launch()
      .then(() => console.log('Telegram bot polling started'))
      .catch((error) => console.error('Failed to start Telegram polling:', error));

    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));
  }
}

// API endpoint for fetching messages
app.get('/api/messages', async (c) => {
  try {
    const result = await db.select().from(messages);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

if (!usePolling) {
  // Webhook endpoint for Telegram with header validation
  app.post('/api/webhook', async (c) => {
    if (!bot) {
      return c.text('Bot not configured', 503);
    }

    // Validate webhook secret token
    const telegramSecret = c.req.header('X-Telegram-Bot-Api-Secret-Token');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (expectedSecret && telegramSecret !== expectedSecret) {
      return c.text('Unauthorized', 401);
    }

    try {
      const body = await c.req.json<Update>();
      await bot.handleUpdate(body);
      return c.text('OK', 200);
    } catch (error) {
      console.error('Webhook error:', error);
      return c.text('Error processing webhook', 500);
    }
  });
}

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export handler for Vercel
export default app;

// Start server for local development (only if not in Vercel environment)
if (!process.env.VERCEL) {
  const port = 3000;
  console.log(`Server is running on port ${port}`);
  
  serve({
    fetch: app.fetch,
    port,
  });
}

