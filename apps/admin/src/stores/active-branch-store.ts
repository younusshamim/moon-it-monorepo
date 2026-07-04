// The branch the admin is currently acting within, selected via the topbar branch switcher. `null`
// means "all branches" (only meaningful for super_admin / institute-wide users). Persisted to
// localStorage so the choice survives reloads. This is a UI selection that *scopes list queries*; it is
// not an authorization signal — the server enforces branch access on every mutation regardless.
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveBranchState {
  activeBranchId: string | null;
  setActiveBranchId: (branchId: string | null) => void;
}

export const useActiveBranchStore = create<ActiveBranchState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
    }),
    { name: "moonit.active-branch" },
  ),
);
