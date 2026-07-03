"use client";

import { Badge } from "@moonit/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@moonit/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { useMemo, useState } from "react";
import { AuditDetailDialog } from "./audit-detail-dialog";

export interface DummyAuditLog {
  id: string;
  actorUserId: string | null;
  branchId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

interface LookupActor {
  id: string;
  name: string;
  email: string;
}

interface LookupBranch {
  id: string;
  name: string;
}

const ACTORS: LookupActor[] = [
  { id: "u1", name: "Rafiul Islam", email: "rafiul@moonit.example" },
  { id: "u2", name: "Nusrat Jahan", email: "nusrat@moonit.example" },
  { id: "u3", name: "Tanvir Ahmed", email: "tanvir@moonit.example" },
];

const BRANCHES: LookupBranch[] = [
  { id: "b1", name: "Dhaka Main" },
  { id: "b2", name: "Chittagong" },
  { id: "b3", name: "Sylhet" },
];

const AUDIT_LOGS: DummyAuditLog[] = [
  {
    id: "al1",
    actorUserId: "u1",
    branchId: "b1",
    action: "invoice.void",
    entityType: "invoice",
    entityId: "inv-2044",
    before: { status: "paid", amount: "4500.00" },
    after: { status: "void", amount: "4500.00" },
    createdAt: "2026-06-28T09:12:00+06:00",
  },
  {
    id: "al2",
    actorUserId: "u2",
    branchId: "b1",
    action: "student.enrollment.create",
    entityType: "enrollment",
    entityId: "enr-3312",
    before: null,
    after: { studentId: "s2", courseId: "c1", status: "active" },
    createdAt: "2026-06-27T14:40:00+06:00",
  },
  {
    id: "al3",
    actorUserId: "u1",
    branchId: null,
    action: "user.role.update",
    entityType: "user",
    entityId: "u2",
    before: { roles: ["staff"] },
    after: { roles: ["staff", "branch_manager"] },
    createdAt: "2026-06-26T11:05:00+06:00",
  },
  {
    id: "al4",
    actorUserId: "u3",
    branchId: "b2",
    action: "fee.discount.apply",
    entityType: "fee",
    entityId: "f2",
    before: { registrationFee: "2000.00" },
    after: { registrationFee: "1600.00", discountCode: "EARLYBIRD" },
    createdAt: "2026-06-25T16:22:00+06:00",
  },
  {
    id: "al5",
    actorUserId: "u1",
    branchId: "b1",
    action: "affiliation_body.deactivate",
    entityType: "affiliation_body",
    entityId: "ab3",
    before: { isActive: true },
    after: { isActive: false },
    createdAt: "2026-06-24T10:00:00+06:00",
  },
  {
    id: "al6",
    actorUserId: "u2",
    branchId: "b3",
    action: "registration.status_change",
    entityType: "registration",
    entityId: "r3",
    before: { status: "pending_payment" },
    after: { status: "registered" },
    createdAt: "2026-06-23T13:47:00+06:00",
  },
  {
    id: "al7",
    actorUserId: null,
    branchId: null,
    action: "invoice.payment_reminder.sent",
    entityType: "invoice",
    entityId: "inv-2011",
    before: null,
    after: { remindersSent: 1 },
    createdAt: "2026-06-22T08:30:00+06:00",
  },
  {
    id: "al8",
    actorUserId: "u3",
    branchId: "b2",
    action: "student.profile.update",
    entityType: "student",
    entityId: "s3",
    before: { phone: "+8801700000000" },
    after: { phone: "+8801800000000" },
    createdAt: "2026-06-21T17:15:00+06:00",
  },
  {
    id: "al9",
    actorUserId: "u2",
    branchId: "b1",
    action: "invoice.void",
    entityType: "invoice",
    entityId: "inv-1998",
    before: { status: "overdue", amount: "1200.00" },
    after: { status: "void", amount: "1200.00" },
    createdAt: "2026-06-20T12:05:00+06:00",
  },
];

const ENTITY_TYPES = Array.from(new Set(AUDIT_LOGS.map((log) => log.entityType))).sort();

function actionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (/\.(void|delete|deactivate|cancel)$/.test(action)) return "destructive";
  if (/\.(update|status_change)$/.test(action)) return "outline";
  if (/\.(create|apply|sent)$/.test(action)) return "secondary";
  return "default";
}

export function AuditLogTable() {
  const [actorFilter, setActorFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<DummyAuditLog | null>(null);

  function actorLabel(actorUserId: string | null) {
    const actor = ACTORS.find((a) => a.id === actorUserId);
    return actor ? { name: actor.name, email: actor.email } : null;
  }

  function branchLabel(branchId: string | null) {
    return BRANCHES.find((b) => b.id === branchId)?.name ?? "—";
  }

  const filteredLogs = useMemo(() => {
    return AUDIT_LOGS.filter((log) => {
      if (actorFilter !== "all" && log.actorUserId !== actorFilter) return false;
      if (branchFilter !== "all" && log.branchId !== branchFilter) return false;
      if (entityTypeFilter !== "all" && log.entityType !== entityTypeFilter) return false;
      return true;
    });
  }, [actorFilter, branchFilter, entityTypeFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{filteredLogs.length} entries</p>

        <div className="flex flex-wrap gap-3">
          <Select value={actorFilter} onValueChange={setActorFilter}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Actor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actors</SelectItem>
              {ACTORS.map((actor) => (
                <SelectItem key={actor.id} value={actor.id}>
                  {actor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {BRANCHES.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entity types</SelectItem>
              {ENTITY_TYPES.map((entityType) => (
                <SelectItem key={entityType} value={entityType}>
                  {entityType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const actor = actorLabel(log.actorUserId);
              return (
                <TableRow
                  key={log.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <TableCell className="text-sm text-muted-foreground">{log.createdAt}</TableCell>

                  <TableCell className="text-sm">{actor?.name ?? "System"}</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {branchLabel(log.branchId)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {log.entityType} / {log.entityId ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AuditDetailDialog
        log={selectedLog}
        open={selectedLog !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedLog(null);
        }}
        actorLabel={actorLabel}
        branchLabel={branchLabel}
      />
    </div>
  );
}
