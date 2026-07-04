"use client";

import { PERMISSIONS } from "@moonit/schema";
import { Badge } from "@moonit/ui/components/badge";
import { Button } from "@moonit/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useRemoveUserRole } from "@/lib/api/mutations/users";
import { branchesQueryOptions } from "@/lib/api/queries/branches";
import { rolesQueryOptions } from "@/lib/api/queries/roles";
import { userRolesQueryOptions, usersQueryOptions } from "@/lib/api/queries/users";
import { AssignRoleDrawer } from "./assign-role-drawer";

interface AssignmentRow {
  id: string;
  userName: string;
  userEmail: string;
  roleName: string;
  branchId: string | null;
  branchName: string | null;
}

export function RoleAssignmentsTab() {
  const canManage = useHasPermission()(PERMISSIONS.USER_MANAGE);
  const { data: usersPage } = useQuery(usersQueryOptions({ pageSize: 100 }));
  const { data: roles = [] } = useQuery(rolesQueryOptions());
  const { data: branchesPage } = useQuery(branchesQueryOptions({ pageSize: 100 }));
  const removeUserRole = useRemoveUserRole();

  const users = useMemo(() => usersPage?.data ?? [], [usersPage]);
  const branches = useMemo(() => branchesPage?.data ?? [], [branchesPage]);
  const roleName = useMemo(() => new Map(roles.map((r) => [r.id, r.name])), [roles]);
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  // Assignments live per user (`GET /users/:id/roles`); fan out over the loaded users and flatten.
  const roleResults = useQueries({
    queries: users.map((user) => userRolesQueryOptions(user.id)),
  });
  const assignments: AssignmentRow[] = users.flatMap((user, index) =>
    (roleResults[index]?.data ?? []).map((ur) => ({
      id: ur.id,
      userName: user.fullName,
      userEmail: user.email,
      roleName: roleName.get(ur.roleId) ?? ur.roleId,
      branchId: ur.branchId,
      branchName: ur.branchId ? (branchName.get(ur.branchId) ?? null) : null,
    })),
  );

  function handleRevoke(row: AssignmentRow) {
    removeUserRole.mutate(row.id, {
      onSuccess: () => toast.success(`Revoked ${row.roleName} from ${row.userName}`),
      onError: (err) => toast.error(errorMessage(err, "Could not revoke assignment")),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{assignments.length} assignments</p>
        {canManage && (
          <AssignRoleDrawer
            users={users.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }))}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
            branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Branch Scope</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No role assignments yet.
                </TableCell>
              </TableRow>
            )}
            {assignments.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.userName}</span>
                    <span className="text-xs text-muted-foreground">{row.userEmail}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {row.roleName}
                  </Badge>
                </TableCell>

                <TableCell>
                  {row.branchId === null ? (
                    <Badge variant="secondary" className="text-xs">
                      All Branches
                    </Badge>
                  ) : (
                    <span className="text-sm">{row.branchName ?? "—"}</span>
                  )}
                </TableCell>

                <TableCell>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(row)}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
