import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db.js";
import { messages } from "db";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// Configure CORS with allowed origins from environment variable
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "https://caden-log-web.vercel.app"],
    credentials: true,
  })
);

// API endpoint for fetching messages
app.get("/api/messages", async (c) => {
  try {
    const result = await db.select().from(messages);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});


// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
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
