import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { OverviewCards } from "@/app/(dashboard)/_components/overview-cards";
import { healthQueryOptions } from "@/lib/api/queries/health";
import { getQueryClient } from "@/lib/query/get-query-client";

export const metadata: Metadata = { title: "Dashboard" };

// The dashboard landing page — the reference for the data-fetching pattern (INFRASTRUCTURE.md §6):
// an RSC prefetches into a per-request QueryClient and dehydrates it; the client leaf reads the same
// query via `useQuery`. The prefetch is not awaited, so the page streams and the client hydrates the
// pending query as it resolves.
export default function DashboardPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(healthQueryOptions());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here's the state of the platform at a glance.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OverviewCards />
      </HydrationBoundary>
    </div>
  );
}
