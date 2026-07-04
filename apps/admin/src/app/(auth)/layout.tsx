import { MoonStarIcon } from "lucide-react";
import type { ReactNode } from "react";

// Centered, minimal shell for signed-out flows (login, etc.). No app chrome.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MoonStarIcon className="size-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Moon IT Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage the institute.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
