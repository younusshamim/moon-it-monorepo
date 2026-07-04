"use client";

import { Badge } from "@moonit/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@moonit/ui/components/dialog";
import type { DummyAuditLog } from "./audit-log-table";

function formatJson(value: Record<string, unknown> | null) {
  return value ? JSON.stringify(value, null, 2) : "—";
}

export function AuditDetailDialog({
  log,
  open,
  onOpenChange,
  actorLabel,
  branchLabel,
}: {
  log: DummyAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actorLabel: (actorUserId: string | null) => { name: string; email: string } | null;
  branchLabel: (branchId: string | null) => string;
}) {
  if (!log) return null;

  const actor = actorLabel(log.actorUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge>{log.action}</Badge>
          </DialogTitle>
          <DialogDescription>{log.createdAt}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Actor</span>
            <span className="font-medium">{actor?.name ?? "System"}</span>
            {actor && <span className="text-xs text-muted-foreground">{actor.email}</span>}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Branch</span>
            <span className="font-medium">{branchLabel(log.branchId)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Entity Type</span>
            <span className="font-medium">{log.entityType}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Entity ID</span>
            <span className="font-medium">{log.entityId ?? "—"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Before</span>
            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
              {formatJson(log.before)}
            </pre>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">After</span>
            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
              {formatJson(log.after)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
