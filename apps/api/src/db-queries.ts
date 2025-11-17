import { db } from "./db-client.js";
import { messages, tags, type MessageWithTag, type Tag } from "db";
import { Hono } from "hono";
import { eq } from "drizzle-orm";

const app = new Hono();

// API endpoint for fetching messages
app.get("/messages", async (c) => {
  try {
    const result = await db
      .select({
        // Message fields
        id: messages.id,
        text: messages.text,
        created_at: messages.created_at,
        display: messages.display,
        tag_id: messages.tag_id,
        // Tag fields (from the joined table)
        name: tags.name,
      })
      .from(messages)
      .leftJoin(tags, eq(messages.tag_id, tags.id))
      .where(eq(messages.display, true));

    return c.json(result as MessageWithTag[]);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// API endpoint for fetching tags
app.get("/tags", async (c) => {
  try {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        created_at: tags.created_at,
      })
      .from(tags)
      .orderBy(tags.name);

    return c.json(result as Tag[]);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return c.json({ error: "Failed to fetch tags" }, 500);
  }
});

export default app;
