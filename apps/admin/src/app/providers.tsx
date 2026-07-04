"use client";

// The app shell's client providers, wired once into the root layout (INFRASTRUCTURE.md §6):
//  - TanStack Query for server state (with the SSR-safe per-environment client),
//  - next-themes for light/dark tokens from @moonit/ui,
//  - nuqs adapter so URL state (filters, pagination, sort) works app-wide,
//  - sonner toaster for feedback.
// Zustand stores need no provider — they're imported directly where used.
import { Toaster } from "@moonit/ui/components/sonner";
import { TooltipProvider } from "@moonit/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query/get-query-client";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TooltipProvider>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
