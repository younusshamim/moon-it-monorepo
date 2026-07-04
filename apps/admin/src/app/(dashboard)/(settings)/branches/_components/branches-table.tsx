"use client";

import type { Branch } from "@moonit/schema";
import { PERMISSIONS } from "@moonit/schema";
import { Badge } from "@moonit/ui/components/badge";
import { Button } from "@moonit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@moonit/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useDeleteBranch, useUpdateBranch } from "@/lib/api/mutations/branches";
import { branchesQueryOptions } from "@/lib/api/queries/branches";
import { CreateBranchDrawer } from "./create-branch-drawer";
import { EditBranchDrawer } from "./edit-branch-drawer";

// Timezone options for the branch create/edit forms. Kept here so both drawers share one list.
export const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (GMT+5:45)" },
  { value: "Asia/Yangon", label: "Asia/Yangon (GMT+6:30)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
];

export function BranchesTable() {
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const canManage = useHasPermission()(PERMISSIONS.BRANCH_MANAGE);

  const { data, isLoading, isError, error } = useQuery(branchesQueryOptions({ pageSize: 100 }));
  const deleteBranch = useDeleteBranch();
  const updateBranch = useUpdateBranch();

  const branches = data?.data ?? [];

  function handleDelete(branch: Branch) {
    deleteBranch.mutate(branch.id, {
      onSuccess: () => toast.success(`Deleted ${branch.name}`),
      onError: (err) => toast.error(errorMessage(err, "Could not delete branch")),
    });
  }

  function handleToggleActive(branch: Branch) {
    updateBranch.mutate(
      { id: branch.id, input: { isActive: !branch.isActive } },
      {
        onSuccess: () => toast.success(branch.isActive ? "Branch deactivated" : "Branch activated"),
        onError: (err) => toast.error(errorMessage(err, "Could not update branch")),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${branches.length} branches`}
        </p>
        {canManage && <CreateBranchDrawer />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-destructive">
                  {errorMessage(error, "Failed to load branches")}
                </TableCell>
              </TableRow>
            )}
            {!isError && !isLoading && branches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No branches yet.
                </TableCell>
              </TableRow>
            )}
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{branch.name}</span>
                    <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {branch.code}
                    </code>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span>{branch.city ?? "—"}</span>
                    {branch.addressLine1 && (
                      <span className="text-xs text-muted-foreground">{branch.addressLine1}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span>{branch.phone ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{branch.email ?? "—"}</span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{branch.timezone}</TableCell>

                <TableCell>
                  <Badge variant={branch.isActive ? "secondary" : "outline"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingBranch(branch)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(branch)}>
                          {branch.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(branch)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBranchDrawer
        open={editingBranch !== null}
        onOpenChange={(v) => {
          if (!v) setEditingBranch(null);
        }}
        branch={editingBranch}
      />
    </div>
  );
}
