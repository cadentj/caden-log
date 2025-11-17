import { db } from "./db-client.js";
import { messages } from "db";
import { Hono } from "hono";

const app = new Hono();

// API endpoint for fetching messages
app.get("/messages", async (c) => {
  try {
    const result = await db.select().from(messages);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

export default app;
