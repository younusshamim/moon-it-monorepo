// Client UI state only — sidebar/mobile-nav open state. Kept small and deliberately free of any
// server data (server state lives in TanStack Query; never mirror it here — INFRASTRUCTURE.md §6, §15).
import { create } from "zustand";

interface UiState {
  /** Desktop sidebar collapsed to icons-only. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Mobile navigation sheet open. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
