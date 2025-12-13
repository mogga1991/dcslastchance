// DISABLED: Using Supabase Auth instead
// import { createAuthClient } from "better-auth/react";
// import { organizationClient } from "better-auth/client/plugins";
// // import { polarClient } from "@polar-sh/better-auth";

// Dummy export to prevent import errors during transition
export const authClient = null as any;

/* DISABLED: Using Supabase Auth instead
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    organizationClient(),
    // polarClient() // Temporarily disabled for Vercel deployment - polar plugin works server-side only
  ],
});
*/
