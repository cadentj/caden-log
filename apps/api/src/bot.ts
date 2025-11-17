import { Telegraf, Context } from "telegraf";
import { db } from "./db-client.js";
import { messages, tags, type NewMessage } from "db";
import * as dotenv from "dotenv";
import { Update } from "telegraf/types";
import { eq } from "drizzle-orm";

import { Hono } from "hono";

const app = new Hono();


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

      const originalText = message.text || "";

      // Parse log() prefix
      const logPrefixRegex = /^log\(([^)]*)\)\s*/;
      const match = originalText.match(logPrefixRegex);

      let display = false;
      let tagId: string | null = null;
      let processedText = originalText;

      if (match) {
        // Message has log() prefix
        display = true;

        // Strip prefix and leading whitespace
        processedText = originalText.replace(logPrefixRegex, '');

        // Extract tag argument if present
        const tagArg = match[1]?.trim();

        if (tagArg) {
          // Look up tag in database
          const tagResult = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagArg))
            .limit(1);

          if (tagResult.length > 0 && tagResult[0]) {
            tagId = tagResult[0].id;
          }
          // If tag not found, tagId remains null (as per user requirements)
        }
      }

      const logEntry = {
        text: processedText || null,
        display,
        tag_id: tagId,
      } as NewMessage;

      await db.insert(messages).values(logEntry);
      console.log(
        `Logged message ${message.message_id} from user ${message.from?.id} (display: ${display}, tag_id: ${tagId})`
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
  app.post("/webhook", async (c) => {
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

export default app;