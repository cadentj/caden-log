import { Telegraf, Context } from "telegraf";
import { db } from "./db.js";
import { messages } from "db";
import * as dotenv from "dotenv";
import { Update } from "telegraf/types";
import app from ".";

dotenv.config();

const usePolling = !process.env.VERCEL;
console.log("usePolling", usePolling);

// Initialize Telegraf bot (only if BOT_TOKEN is set)
let bot: Telegraf | null = null;
if (process.env.BOT_TOKEN) {
  bot = new Telegraf(process.env.BOT_TOKEN);

  // Log message to database
  const logMessage = async (ctx: Context): Promise<void> => {
    try {
      const message = ctx.message;
      if (!message || !("text" in message)) return;

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
      console.log(
        `Logged message ${message.message_id} from user ${message.from?.id}`
      );
    } catch (error) {
      console.error("Error logging message:", error);
    }
  };

  // Handle all messages
  bot.on("message", async (ctx) => {
    await logMessage(ctx);
  });

  // Handle errors
  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
  });

  if (usePolling) {
    bot
      .launch()
      .then(() => console.log("Telegram bot polling started"))
      .catch((error) =>
        console.error("Failed to start Telegram polling:", error)
      );

    process.once("SIGINT", () => bot?.stop("SIGINT"));
    process.once("SIGTERM", () => bot?.stop("SIGTERM"));
  }
}

if (!usePolling) {
  // Webhook endpoint for Telegram with header validation
  app.post("/api/webhook", async (c) => {
    if (!bot) {
      return c.text("Bot not configured", 503);
    }

    // Validate webhook secret token
    const telegramSecret = c.req.header("X-Telegram-Bot-Api-Secret-Token");
    const expectedSecret = process.env.WEBHOOK_TOKEN;

    if (expectedSecret && telegramSecret !== expectedSecret) {
      return c.text("Unauthorized", 401);
    }

    try {
      const body = await c.req.json<Update>();
      await bot.handleUpdate(body);
      return c.text("OK", 200);
    } catch (error) {
      console.error("Webhook error:", error);
      return c.text("Error processing webhook", 500);
    }
  });
}
