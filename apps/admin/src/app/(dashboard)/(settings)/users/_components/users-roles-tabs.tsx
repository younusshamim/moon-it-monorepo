"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@moonit/ui/components/tabs";
import { RoleAssignmentsTab } from "./role-assignments-tab";
import { RolesTab } from "./roles-tab";
import { UsersTab } from "./users-tab";

// Each tab fetches its own live data from the IAM API; there is no shared dummy state here anymore.
export function UsersRolesTabs() {
  return (
    <Tabs defaultValue="users">
      <TabsList className="w-sm">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <RolesTab />
      </TabsContent>

      <TabsContent value="assignments" className="mt-6">
        <RoleAssignmentsTab />
      </TabsContent>
    </Tabs>
  );
}
