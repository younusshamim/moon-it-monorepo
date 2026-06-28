"use client";

import { Button } from "@moonit/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@moonit/ui/components/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{section.label}</p>
          )}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            const link = (
              <Button
                key={item.href}
                asChild
                variant={active ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "justify-center")}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                >
                  <item.icon data-icon="inline-start" />
                  {!collapsed && <span>{item.title}</span>}
                  {collapsed && <span className="sr-only">{item.title}</span>}
                </Link>
              </Button>
            );

            if (!collapsed) {
              return link;
            }
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
