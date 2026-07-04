"use client";

// Topbar branch switcher. Lists the branches the current user can act within — all branches for a
// null-scoped (super_admin / institute-wide) user, otherwise just their `branchScope` — and records the
// selection in the active-branch store, which scopes branch-filtered list queries (rooms, departments).
// Purely a UI convenience; the server still authorizes every write against the user's real scope.
import { Button } from "@moonit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@moonit/ui/components/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Building2Icon, ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useSession } from "@/components/session-provider";
import { branchesQueryOptions } from "@/lib/api/queries/branches";
import { useActiveBranchStore } from "@/stores/active-branch-store";

export function BranchSwitcher() {
  const { branchScope } = useSession();
  const activeBranchId = useActiveBranchStore((state) => state.activeBranchId);
  const setActiveBranchId = useActiveBranchStore((state) => state.setActiveBranchId);

  const canSeeAll = branchScope === null;
  const { data } = useQuery(branchesQueryOptions({ pageSize: 100 }));

  // Only the branches the user is scoped to (all of them when null-scoped).
  const branches = useMemo(() => {
    const rows = data?.data ?? [];
    return canSeeAll ? rows : rows.filter((b) => branchScope?.includes(b.id));
  }, [data, canSeeAll, branchScope]);

  // A scoped user can't select "all"; default them to their first branch once data arrives.
  useEffect(() => {
    if (canSeeAll) return;
    const scoped = branchScope ?? [];
    if (activeBranchId === null || !scoped.includes(activeBranchId)) {
      setActiveBranchId(scoped[0] ?? null);
    }
  }, [canSeeAll, branchScope, activeBranchId, setActiveBranchId]);

  const activeLabel =
    activeBranchId === null
      ? "All branches"
      : (branches.find((b) => b.id === activeBranchId)?.name ?? "Select branch");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2Icon data-icon="inline-start" className="size-4" />
          <span className="max-w-40 truncate">{activeLabel}</span>
          <ChevronsUpDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canSeeAll && (
          <DropdownMenuCheckboxItem
            checked={activeBranchId === null}
            onCheckedChange={() => setActiveBranchId(null)}
          >
            All branches
          </DropdownMenuCheckboxItem>
        )}
        {branches.map((branch) => (
          <DropdownMenuCheckboxItem
            key={branch.id}
            checked={activeBranchId === branch.id}
            onCheckedChange={() => setActiveBranchId(branch.id)}
          >
            {branch.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
