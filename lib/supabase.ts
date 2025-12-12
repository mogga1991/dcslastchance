import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

// Client-side Supabase client (uses anon key)
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabase) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables are not configured');
      }
      _supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }
    return Reflect.get(_supabase, prop);
  }
});

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase admin environment variables are not configured');
      }
      _supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }
    return Reflect.get(_supabaseAdmin, prop);
  }
});
