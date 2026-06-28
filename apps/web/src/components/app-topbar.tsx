"use client";

import { Button } from "@moonit/ui/components/button";
import { MenuIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { type SessionUser, UserMenu } from "@/components/user-menu";
import { useUiStore } from "@/stores/ui-store";

export function AppTopbar({ user }: { user: SessionUser }) {
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

      <div className="flex-1" />

      <ThemeToggle />
      <UserMenu user={user} />
    </header>
  );
}
