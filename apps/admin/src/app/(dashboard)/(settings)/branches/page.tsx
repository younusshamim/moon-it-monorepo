import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { BranchesTable } from "./_components/branches-table";

export const metadata: Metadata = { title: "Branches" };

export default function BranchesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Branches"
        description="Manage institute branches, locations, and contact details."
      />
      <BranchesTable />
    </div>
  );
}
