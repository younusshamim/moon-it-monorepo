import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import type { SessionUser } from "@/components/user-menu";

// The authenticated shell renders per request: it's gated by the proxy, reads the session on the
// server, and fetches user-specific data — none of which can be prerendered at build (INFRASTRUCTURE.md §6).
export const dynamic = "force-dynamic";

// TODO(@moonit/auth): replace with a server-side session read once the auth server config lands.
// The proxy (middleware) already guarantees a session cookie is present to reach this layout, so this
// is the seam where the real user gets fetched on the server and passed into the shell.
const PLACEHOLDER_USER: SessionUser = {
  name: "Moon Admin",
  email: "admin@moonit.example",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <MobileSidebar />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <AppTopbar user={PLACEHOLDER_USER} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
