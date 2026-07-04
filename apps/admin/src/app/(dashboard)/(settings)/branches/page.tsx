import type { Metadata } from "next";
import { BranchesTable } from "./_components/branches-table";

export const metadata: Metadata = { title: "Branches" };

export default function BranchesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Branches</h1>
        <p className="text-muted-foreground">
          Manage institute branches, locations, and contact details.
        </p>
      </div>
      <BranchesTable />
    </div>
  );
}
