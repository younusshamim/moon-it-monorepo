"use client";

// Client leaf that reads the server-prefetched health query. Demonstrates the three TanStack Query
// states the dashboard handles everywhere: pending (Skeleton), error (graceful), success (data).
import { Badge } from "@moonit/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@moonit/ui/components/card";
import { Skeleton } from "@moonit/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { healthQueryOptions } from "@/lib/api/queries/health";

function ApiStatusCard() {
  const { data, isPending, isError } = useQuery(healthQueryOptions());

  return (
    <Card>
      <CardHeader>
        <CardDescription>API status</CardDescription>
        <CardTitle>NestJS backend</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-6 w-20" />
        ) : isError ? (
          <Badge variant="destructive">Unreachable</Badge>
        ) : (
          <Badge variant={data?.status === "ok" ? "secondary" : "destructive"}>
            {data?.status === "ok" ? "Operational" : (data?.status ?? "Unknown")}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder metric cards. These get their data source when the corresponding feature modules land;
// for now they show the empty state so the shell reads as a real dashboard.
const PLACEHOLDER_METRICS = [
  { label: "Active students", hint: "Awaiting students module" },
  { label: "Open enrollments", hint: "Awaiting enrollments module" },
  { label: "Revenue (30d)", hint: "Awaiting finance module" },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ApiStatusCard />
      {PLACEHOLDER_METRICS.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-2xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{metric.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
