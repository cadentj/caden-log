import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";

import bot from "./bot.js";
import dbQueries from "./db-queries.js";

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

app.route("/bot", bot);
app.route("/api", dbQueries);

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
