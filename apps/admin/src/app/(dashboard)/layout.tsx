import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { SessionProvider } from "@/components/session-provider";
import { getSessionUser } from "@/lib/api/session";

// The authenticated shell renders per request: it's gated by the proxy, reads the session on the
// server, and fetches user-specific data — none of which can be prerendered at build (INFRASTRUCTURE.md §6).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Server-side session read (defence-in-depth behind the optimistic proxy): the cookie may be present
  // but expired/invalid, so verify with the API and bounce to /login when there's no real session.
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-svh">
        <AppSidebar />
        <MobileSidebar />
        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
