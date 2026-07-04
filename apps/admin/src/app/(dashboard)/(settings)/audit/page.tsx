import type { Metadata } from "next";
import { AuditLogTable } from "./_components/audit-log-table";

export const metadata: Metadata = { title: "Audit Log" };

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          A read-only trail of sensitive actions across the platform. Filter by actor, branch, or
          entity type, and click a row to inspect the before/after snapshot.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
