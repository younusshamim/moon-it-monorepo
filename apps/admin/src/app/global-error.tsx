"use client";

// Top-level error boundary for the root layout. Must render its own <html>/<body> because it replaces
// the whole tree when the root layout itself throws.
import { Button } from "@moonit/ui/components/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: report to Sentry once observability is wired (INFRASTRUCTURE.md §11).
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        </div>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
