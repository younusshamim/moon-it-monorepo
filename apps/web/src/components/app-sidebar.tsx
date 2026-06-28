"use client";

// Desktop sidebar (hidden below `lg`). Collapsed/expanded state lives in the Zustand UI store, so the
// topbar's collapse button and the sidebar stay in sync without prop drilling.
import { Button } from "@moonit/ui/components/button";
import { Separator } from "@moonit/ui/components/separator";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Brand } from "@/components/brand";
import { SidebarNav } from "@/components/sidebar-nav";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function AppSidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center px-4", collapsed && "justify-center px-2")}>
        <Brand collapsed={collapsed} />
      </div>
      <Separator />
      <SidebarNav collapsed={collapsed} />
      <Separator />
      <div className={cn("p-3", collapsed && "flex justify-center")}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={toggleSidebar}
          className={cn(!collapsed && "w-full justify-start")}
        >
          {collapsed ? (
            <PanelLeftOpenIcon data-icon="inline-start" />
          ) : (
            <PanelLeftCloseIcon data-icon="inline-start" />
          )}
          {!collapsed && <span>Collapse</span>}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </aside>
  );
}
