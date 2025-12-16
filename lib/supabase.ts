import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

// Placeholder URL and key for build time
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

// Check if we're in build time (env vars not available)
const isBuildTime = () => !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Client-side Supabase client (uses anon key)
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabase) {
      // During build time, use placeholder values
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;
      _supabase = createClient<Database>(url, key);
    }
    return Reflect.get(_supabase, prop);
  }
});

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      // During build time, use placeholder values
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY;
      _supabaseAdmin = createClient<Database>(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
    return Reflect.get(_supabaseAdmin, prop);
  }
});
