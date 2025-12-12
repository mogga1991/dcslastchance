import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

config({ path: ".env" }); // or .env.local

let _db: NeonHttpDatabase<Record<string, never>> | null = null;

export const db = new Proxy({} as NeonHttpDatabase<Record<string, never>>, {
  get(target, prop) {
    if (!_db) {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
      }
      _db = drizzle(process.env.DATABASE_URL);
    }
    return Reflect.get(_db, prop);
  }
});
