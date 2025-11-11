import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();
const PORT = process.env.PORT || 8080;

// Validate required environment variables
const requiredEnvVars = ['BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set`);
    process.exit(1);
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Health check endpoint for Fly.io
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook endpoint for Telegram
app.post(`/webhook/${process.env.BOT_TOKEN}`, async (c) => {
  try {
    const body = await c.req.json();
    await bot.handleUpdate(body);
    return c.text('OK', 200);
  } catch (error) {
    console.error('Webhook error:', error);
    return c.text('Error processing webhook', 500);
  }
});

// Log message to Supabase
async function logMessage(ctx) {
  try {
    const message = ctx.message;
    if (!message) return;

    const logEntry = {
      message_id: message.message_id,
      user_id: message.from?.id || null,
      username: message.from?.username || null,
      first_name: message.from?.first_name || null,
      last_name: message.from?.last_name || null,
      chat_id: message.chat.id,
      chat_type: message.chat.type,
      text: message.text || null,
      timestamp: new Date(message.date * 1000).toISOString(),
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('messages')
      .insert([logEntry]);

    if (error) {
      console.error('Error logging to Supabase:', error);
    } else {
      console.log(`Logged message ${message.message_id} from user ${message.from?.id}`);
    }
  } catch (error) {
    console.error('Error in logMessage:', error);
  }
}

// Handle all messages
bot.on('message', async (ctx) => {
  await logMessage(ctx);
  
  // Optional: Echo back a confirmation (remove if not needed)
  // await ctx.reply('Message logged!');
});

// Handle errors
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Start Hono server
const server = serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`Server running on port ${info.port}`);
  
  // Set webhook if WEBHOOK_DOMAIN is set
  if (process.env.WEBHOOK_DOMAIN) {
    const webhookPath = `/webhook/${process.env.BOT_TOKEN}`;
    const webhookUrl = `${process.env.WEBHOOK_DOMAIN}${webhookPath}`;
    
    bot.telegram.setWebhook(webhookUrl)
      .then(() => {
        console.log(`Webhook set to: ${webhookUrl}`);
      })
      .catch((error) => {
        console.error('Error setting webhook:', error);
      });
  } else {
    console.log('WEBHOOK_DOMAIN not set, using long-polling mode');
    bot.launch();
  }
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  bot.stop('SIGINT');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.once('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  bot.stop('SIGTERM');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

