"use client";

import { PERMISSIONS, type Role } from "@moonit/schema";
import { Badge } from "@moonit/ui/components/badge";
import { Button } from "@moonit/ui/components/button";
import { Checkbox } from "@moonit/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useDeleteRole } from "@/lib/api/mutations/roles";
import { permissionsQueryOptions } from "@/lib/api/queries/permissions";
import { rolePermissionsQueryOptions, rolesQueryOptions } from "@/lib/api/queries/roles";
import { CreateRoleDrawer } from "./create-role-drawer";
import { EditRoleDrawer } from "./edit-role-drawer";

export function RolesTab() {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const canManage = useHasPermission()(PERMISSIONS.ROLE_MANAGE);

  const { data: roles = [] } = useQuery(rolesQueryOptions());
  const { data: permissions = [] } = useQuery(permissionsQueryOptions());
  const deleteRole = useDeleteRole();

  // One grant query per role for the permission matrix (bare arrays are cheap; TanStack dedupes).
  const grantResults = useQueries({
    queries: roles.map((role) => rolePermissionsQueryOptions(role.id)),
  });
  const grantsByRole = new Map<string, Set<string>>(
    roles.map((role, index) => [
      role.id,
      new Set((grantResults[index]?.data ?? []).map((p) => p.id)),
    ]),
  );

  function handleDelete(role: Role) {
    deleteRole.mutate(role.id, {
      onSuccess: () => toast.success(`Deleted ${role.name}`),
      onError: (err) => toast.error(errorMessage(err, "Could not delete role")),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Roles list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Roles</h3>
          {canManage && <CreateRoleDrawer permissions={permissions} />}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {role.key}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{role.name}</TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Shield className="h-3 w-3" />
                        System
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={role.isSystem || !canManage}
                      onClick={() => setEditingRole(role)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={role.isSystem || !canManage}
                      onClick={() => handleDelete(role)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Permission matrix (read-only view; edit a custom role above to change grants) */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold">Permission Matrix</h3>
          <p className="text-xs text-muted-foreground">
            System roles are read-only. Edit a custom role to change its grants.
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[200px]">
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-center font-medium text-muted-foreground min-w-[120px]"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, i) => (
                <tr key={permission.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <code className="text-xs font-mono">{permission.key}</code>
                      <span className="text-xs text-muted-foreground">
                        {permission.description}
                      </span>
                    </div>
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} className="px-4 py-3 text-center">
                      <Checkbox
                        checked={grantsByRole.get(role.id)?.has(permission.id) ?? false}
                        disabled
                        aria-label={`${role.name} — ${permission.key}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditRoleDrawer
        open={editingRole !== null}
        onOpenChange={(v) => {
          if (!v) setEditingRole(null);
        }}
        role={editingRole}
        permissions={permissions}
        grantedPermissionIds={editingRole ? [...(grantsByRole.get(editingRole.id) ?? [])] : []}
      />
    </div>
  );
}
