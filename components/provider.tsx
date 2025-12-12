"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Only use ClerkProvider if the publishable key is available
  const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      forcedTheme="light"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );

  if (hasClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
