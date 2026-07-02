"use client";

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
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CreateDepartmentDrawer } from "./create-department-drawer";
import { EditDepartmentDrawer } from "./edit-department-drawer";

export interface DepartmentBranch {
  id: string;
  name: string;
}

export interface DummyDepartment {
  id: string;
  name: string;
  branchId: string | null;
  branchName: string | null;
}

export const BRANCHES: DepartmentBranch[] = [
  { id: "b1", name: "Dhaka Main" },
  { id: "b2", name: "Chittagong" },
  { id: "b3", name: "Sylhet" },
  { id: "b4", name: "Rajshahi" },
];

const DEPARTMENTS: DummyDepartment[] = [
  { id: "d1", name: "IT", branchId: null, branchName: null },
  { id: "d2", name: "Languages", branchId: null, branchName: null },
  { id: "d3", name: "Diploma", branchId: "b1", branchName: "Dhaka Main" },
  { id: "d4", name: "Admissions", branchId: "b2", branchName: "Chittagong" },
];

export function DepartmentsTable() {
  const [editingDepartment, setEditingDepartment] = useState<DummyDepartment | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{DEPARTMENTS.length} departments</p>
        <CreateDepartmentDrawer branches={BRANCHES} />
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
            {DEPARTMENTS.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium text-sm">{department.name}</TableCell>

                <TableCell>
                  {department.branchId === null ? (
                    <Badge variant="secondary" className="text-xs">
                      Institute-wide
                    </Badge>
                  ) : (
                    <span className="text-sm">{department.branchName}</span>
                  )}
                </TableCell>

                <TableCell>
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
                      <DropdownMenuItem variant="destructive" disabled>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        branches={BRANCHES}
      />
    </div>
  );
}
