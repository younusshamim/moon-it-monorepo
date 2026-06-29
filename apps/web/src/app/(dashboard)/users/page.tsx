import type { Metadata } from "next";
import { UsersRolesTabs } from "./_components/users-roles-tabs";

export const metadata: Metadata = { title: "Users & Roles" };

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users & Roles</h1>
        <p className="text-muted-foreground">Manage system users, roles, and access permissions.</p>
      </div>
      <UsersRolesTabs />
    </div>
  );
}
