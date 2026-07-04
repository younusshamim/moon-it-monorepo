"use client";

import { type Department, PERMISSIONS } from "@moonit/schema";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useDeleteDepartment } from "@/lib/api/mutations/departments";
import { branchesQueryOptions } from "@/lib/api/queries/branches";
import { departmentsQueryOptions } from "@/lib/api/queries/departments";
import { CreateDepartmentDrawer } from "./create-department-drawer";
import { EditDepartmentDrawer } from "./edit-department-drawer";

export interface DepartmentBranch {
  id: string;
  name: string;
}

export function DepartmentsTable() {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const canManage = useHasPermission()(PERMISSIONS.DEPARTMENT_MANAGE);

  const branchesQuery = useQuery(branchesQueryOptions({ pageSize: 100 }));
  const branches: DepartmentBranch[] = useMemo(
    () => (branchesQuery.data?.data ?? []).map((b) => ({ id: b.id, name: b.name })),
    [branchesQuery.data],
  );
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  const { data, isLoading, isError, error } = useQuery(departmentsQueryOptions({ pageSize: 100 }));
  const deleteDepartment = useDeleteDepartment();
  const departments = data?.data ?? [];

  function handleDelete(department: Department) {
    deleteDepartment.mutate(department.id, {
      onSuccess: () => toast.success(`Deleted ${department.name}`),
      onError: (err) => toast.error(errorMessage(err, "Could not delete department")),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${departments.length} departments`}
        </p>
        {canManage && <CreateDepartmentDrawer branches={branches} />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branch Scope</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-destructive">
                  {errorMessage(error, "Failed to load departments")}
                </TableCell>
              </TableRow>
            )}
            {!isError && !isLoading && departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  No departments yet.
                </TableCell>
              </TableRow>
            )}
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium text-sm">{department.name}</TableCell>

                <TableCell>
                  {department.branchId === null ? (
                    <Badge variant="secondary" className="text-xs">
                      Institute-wide
                    </Badge>
                  ) : (
                    <span className="text-sm">{branchName.get(department.branchId) ?? "—"}</span>
                  )}
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
                        <DropdownMenuItem onClick={() => setEditingDepartment(department)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(department)}
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

      <EditDepartmentDrawer
        open={editingDepartment !== null}
        onOpenChange={(v) => {
          if (!v) setEditingDepartment(null);
        }}
        department={editingDepartment}
        branches={branches}
      />
    </div>
  );
}
