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
import type { LookupBranch, LookupCourse } from "./affiliations-tabs";
import { CreateFeeDrawer } from "./create-fee-drawer";
import { EditFeeDrawer } from "./edit-fee-drawer";

export interface DummyFee {
  id: string;
  courseId: string;
  branchId: string | null;
  registrationFee: string;
  currency: string;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}

export function FeesTab({
  fees,
  courses,
  branches,
}: {
  fees: DummyFee[];
  courses: LookupCourse[];
  branches: LookupBranch[];
}) {
  const [editingFee, setEditingFee] = useState<DummyFee | null>(null);

  function courseLabel(courseId: string) {
    const course = courses.find((c) => c.id === courseId);
    return course ? `${course.title} (${course.code})` : "—";
  }

  function branchLabel(branchId: string | null) {
    if (branchId === null) return null;
    return branches.find((b) => b.id === branchId)?.name ?? "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{fees.length} exam fees</p>
        <CreateFeeDrawer courses={courses} branches={branches} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Branch Scope</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="text-sm">{courseLabel(fee.courseId)}</TableCell>

                <TableCell>
                  {branchLabel(fee.branchId) === null ? (
                    <Badge variant="secondary" className="text-xs">
                      All Branches
                    </Badge>
                  ) : (
                    <span className="text-sm">{branchLabel(fee.branchId)}</span>
                  )}
                </TableCell>

                <TableCell className="text-sm font-medium">
                  {fee.currency} {fee.registrationFee}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {fee.validFrom ?? "—"} – {fee.validTo ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge variant={fee.isActive ? "secondary" : "outline"}>
                    {fee.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => setEditingFee(fee)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        {fee.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditFeeDrawer
        open={editingFee !== null}
        onOpenChange={(v) => {
          if (!v) setEditingFee(null);
        }}
        fee={editingFee}
        courses={courses}
        branches={branches}
      />
    </div>
  );
}
