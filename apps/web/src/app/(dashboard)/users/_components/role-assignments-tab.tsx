"use client";

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
import { type AssignableRole, type AssignableUser, AssignRoleDrawer } from "./assign-role-drawer";

export interface DummyUserRole {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  branchId: string | null;
  branchName: string | null;
}

export function RoleAssignmentsTab({
  userRoles,
  users,
  roles,
}: {
  userRoles: DummyUserRole[];
  users: AssignableUser[];
  roles: AssignableRole[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{userRoles.length} assignments</p>
        <AssignRoleDrawer users={users} roles={roles} />
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
            {userRoles.map((ur) => (
              <TableRow key={ur.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{ur.userName}</span>
                    <span className="text-xs text-muted-foreground">{ur.userEmail}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ur.roleName}
                  </Badge>
                </TableCell>

                <TableCell>
                  {ur.branchId === null ? (
                    <Badge variant="secondary" className="text-xs">
                      All Branches
                    </Badge>
                  ) : (
                    <span className="text-sm">{ur.branchName}</span>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
