import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// This function determines whether to use a Cloudflare D1 binding or a local LibSQL client.
const getDb = () => {
  // 1. Check if we are in a Cloudflare environment with a D1 binding named "DB"
  // Note: This is typical for Cloudflare Workers/Pages.
  const runtimeEnv = process.env as any;
  if (runtimeEnv.DB) {
    return drizzleD1(runtimeEnv.DB, { schema });
  }

  // 2. Fallback to LibSQL (local SQLite file or remote Turso)
  const client = createClient({
    url: process.env.DATABASE_URL || "file:./local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  
  return drizzleLibsql(client, { 
    schema, 
    logger: process.env.NODE_ENV === "development" 
  });
};

export const db = getDb();
