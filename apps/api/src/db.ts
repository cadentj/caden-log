import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "db";
import { config as loadEnv } from "dotenv";

loadEnv();

// Use { prepare: false } for Transaction pooler compatibility (required for Supabase)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
