import { MoonStarIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// The product mark, reused by the sidebar and the mobile nav header. The crescent ties the mark to
// the "Moon IT" name rather than a generic monogram.
export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", collapsed && "justify-center")}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MoonStarIcon className="size-4" />
      </span>
      {!collapsed && <span className="truncate tracking-tight">Moon IT</span>}
    </Link>
  );
}
