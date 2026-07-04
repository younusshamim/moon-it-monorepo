import type { Metadata } from "next";
import { DepartmentsTable } from "./_components/departments-table";

export const metadata: Metadata = { title: "Departments" };

export default function DepartmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">
          Manage departments and their branch scope across the institute.
        </p>
      </div>
      <DepartmentsTable />
    </div>
  );
}
