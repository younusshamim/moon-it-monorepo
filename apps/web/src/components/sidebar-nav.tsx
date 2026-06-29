"use client";

import { Button } from "@moonit/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@moonit/ui/components/tooltip";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_SECTIONS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasActiveDescendant(pathname: string, item: NavItem): boolean {
  return item.children?.some((child) => child.href && isActive(pathname, child.href)) ?? false;
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.children && hasActiveDescendant(pathname, item)) {
          initial.add(item.title);
        }
      }
    }
    return initial;
  });

  function toggle(title: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  function renderLeafItem(item: NavItem) {
    if (!item.href) return null;
    const active = isActive(pathname, item.href);

    const link = (
      <Button
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
      return <div key={item.href}>{link}</div>;
    }
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  function renderParentItem(item: NavItem) {
    const isExpanded = expanded.has(item.title);
    const hasActive = hasActiveDescendant(pathname, item);

    const trigger = (
      <Button
        variant={hasActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start", collapsed && "justify-center")}
        onClick={() => toggle(item.title)}
      >
        <item.icon data-icon="inline-start" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </>
        )}
        {collapsed && <span className="sr-only">{item.title}</span>}
      </Button>
    );

    return (
      <div key={item.title}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          trigger
        )}
        {!collapsed && isExpanded && (
          <div className="mt-1 flex flex-col gap-1 border-l ml-3 pl-3">
            {item.children!.map((child) => renderLeafItem(child))}
          </div>
        )}
      </div>
    );
  }

  function renderItem(item: NavItem) {
    return item.children ? renderParentItem(item) : renderLeafItem(item);
  }

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{section.label}</p>
          )}
          {section.items.map((item) => renderItem(item))}
        </div>
      ))}
    </nav>
  );
}
