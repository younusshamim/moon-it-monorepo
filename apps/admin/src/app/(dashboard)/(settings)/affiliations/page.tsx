import type { Metadata } from "next";
import { AffiliationsTabs } from "./_components/affiliations-tabs";

export const metadata: Metadata = { title: "Affiliations" };

export default function AffiliationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Affiliations</h1>
        <p className="text-muted-foreground">
          Manage affiliation bodies, government exam fees, exam events, and student registrations.
        </p>
      </div>
      <AffiliationsTabs />
    </div>
  );
}
