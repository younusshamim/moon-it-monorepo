"use client";

import { Button } from "@moonit/ui/components/button";
import { MenuIcon } from "lucide-react";
import { BranchSwitcher } from "@/components/branch-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { useUiStore } from "@/stores/ui-store";

export function AppTopbar() {
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
      >
        <MenuIcon />
        <span className="sr-only">Open navigation</span>
      </Button>

      <BranchSwitcher />

      <div className="flex-1" />

      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
