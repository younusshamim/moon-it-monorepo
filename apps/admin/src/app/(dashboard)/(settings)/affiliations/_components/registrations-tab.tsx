"use client";

import { Badge } from "@moonit/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { useState } from "react";
import type { LookupBranch, LookupStudent } from "./affiliations-tabs";
import { CreateRegistrationDrawer } from "./create-registration-drawer";
import { EditRegistrationDrawer } from "./edit-registration-drawer";
import type { DummyEvent } from "./events-tab";

export type RegistrationStatus =
  | "pending_payment"
  | "registered"
  | "admit_issued"
  | "appeared"
  | "passed"
  | "failed"
  | "absent"
  | "cancelled";

export interface DummyRegistration {
  id: string;
  studentId: string;
  examEventId: string;
  branchId: string;
  status: RegistrationStatus;
  boardRollNumber: string | null;
  boardRegistrationNumber: string | null;
  resultGrade: string | null;
  resultMarks: string | null;
  registeredAt: string | null;
}

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending_payment: "Pending Payment",
  registered: "Registered",
  admit_issued: "Admit Issued",
  appeared: "Appeared",
  passed: "Passed",
  failed: "Failed",
  absent: "Absent",
  cancelled: "Cancelled",
};

const STATUS_VARIANT: Record<
  RegistrationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending_payment: "outline",
  registered: "secondary",
  admit_issued: "secondary",
  appeared: "secondary",
  passed: "default",
  failed: "destructive",
  absent: "destructive",
  cancelled: "outline",
};

export function RegistrationsTab({
  registrations,
  events,
  students,
  branches,
}: {
  registrations: DummyRegistration[];
  events: DummyEvent[];
  students: LookupStudent[];
  branches: LookupBranch[];
}) {
  const [editingRegistration, setEditingRegistration] = useState<DummyRegistration | null>(null);

  function studentLabel(studentId: string) {
    const student = students.find((s) => s.id === studentId);
    return student ? { name: student.fullName, code: student.studentCode } : null;
  }

  function eventLabel(examEventId: string) {
    return events.find((e) => e.id === examEventId)?.title ?? "—";
  }

  function branchLabel(branchId: string) {
    return branches.find((b) => b.id === branchId)?.name ?? "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{registrations.length} registrations</p>
        <CreateRegistrationDrawer events={events} students={students} branches={branches} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Exam Event</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roll / Reg No.</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => {
              const student = studentLabel(registration.studentId);
              return (
                <TableRow
                  key={registration.id}
                  className="cursor-pointer"
                  onClick={() => setEditingRegistration(registration)}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{student?.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{student?.code ?? "—"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{eventLabel(registration.examEventId)}</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {branchLabel(registration.branchId)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={STATUS_VARIANT[registration.status]}>
                      {STATUS_LABEL[registration.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {registration.boardRollNumber ?? "—"} /{" "}
                    {registration.boardRegistrationNumber ?? "—"}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {registration.resultGrade
                      ? `${registration.resultGrade} (${registration.resultMarks ?? "—"})`
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditRegistrationDrawer
        open={editingRegistration !== null}
        onOpenChange={(v) => {
          if (!v) setEditingRegistration(null);
        }}
        registration={editingRegistration}
      />
    </div>
  );
}
