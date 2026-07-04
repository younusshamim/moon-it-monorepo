"use client";

// Mobile navigation — the sidebar rendered inside a Sheet, controlled by the Zustand UI store and
// opened from the topbar's menu button.
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@moonit/ui/components/sheet";
import { Brand } from "@/components/brand";
import { SidebarNav } from "@/components/sidebar-nav";
import { useUiStore } from "@/stores/ui-store";

export function MobileSidebar() {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 flex-row items-center border-b">
          <SheetTitle className="text-left">
            <Brand />
          </SheetTitle>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
