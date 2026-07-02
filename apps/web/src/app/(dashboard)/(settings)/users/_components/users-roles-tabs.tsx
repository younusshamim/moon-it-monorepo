"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@moonit/ui/components/tabs";
import { type DummyUserRole, RoleAssignmentsTab } from "./role-assignments-tab";
import { type DummyPermission, type DummyRole, RolesTab } from "./roles-tab";
import { type DummyUser, UsersTab } from "./users-tab";

const USERS: DummyUser[] = [
  {
    id: "u1",
    fullName: "Alice Rahman",
    email: "alice@moonit.example",
    phone: "+8801700000001",
    status: "active",
    emailVerifiedAt: "2024-01-15",
    assignedRoles: ["Super Admin"],
  },
  {
    id: "u2",
    fullName: "Bob Islam",
    email: "bob@moonit.example",
    phone: "+8801700000002",
    status: "active",
    emailVerifiedAt: "2024-02-20",
    assignedRoles: ["Branch Admin"],
  },
  {
    id: "u3",
    fullName: "Carol Hoque",
    email: "carol@moonit.example",
    phone: null,
    status: "invited",
    emailVerifiedAt: null,
    assignedRoles: [],
  },
  {
    id: "u4",
    fullName: "David Khan",
    email: "david@moonit.example",
    phone: "+8801700000004",
    status: "suspended",
    emailVerifiedAt: "2024-03-10",
    assignedRoles: ["Instructor"],
  },
];

const ROLES: DummyRole[] = [
  { id: "r1", key: "super_admin", name: "Super Admin", isSystem: true },
  { id: "r2", key: "branch_admin", name: "Branch Admin", isSystem: true },
  { id: "r3", key: "instructor", name: "Instructor", isSystem: false },
  { id: "r4", key: "accountant", name: "Accountant", isSystem: false },
  { id: "r5", key: "receptionist", name: "Receptionist", isSystem: false },
];

const PERMISSIONS: DummyPermission[] = [
  { id: "p1", key: "enrollment.create", description: "Create enrollments" },
  { id: "p2", key: "enrollment.read", description: "View enrollments" },
  { id: "p3", key: "invoice.create", description: "Create invoices" },
  { id: "p4", key: "invoice.refund", description: "Refund invoices" },
  { id: "p5", key: "user.manage", description: "Manage users & roles" },
  { id: "p6", key: "role.manage", description: "Edit role permissions" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  r1: ["p1", "p2", "p3", "p4", "p5", "p6"],
  r2: ["p1", "p2", "p3"],
  r3: ["p2"],
  r4: ["p3", "p4"],
};

const USER_ROLES: DummyUserRole[] = [
  {
    id: "ur1",
    userId: "u1",
    userName: "Alice Rahman",
    userEmail: "alice@moonit.example",
    roleId: "r1",
    roleName: "Super Admin",
    branchId: null,
    branchName: null,
  },
  {
    id: "ur2",
    userId: "u2",
    userName: "Bob Islam",
    userEmail: "bob@moonit.example",
    roleId: "r2",
    roleName: "Branch Admin",
    branchId: "b1",
    branchName: "Dhaka Main",
  },
  {
    id: "ur3",
    userId: "u4",
    userName: "David Khan",
    userEmail: "david@moonit.example",
    roleId: "r3",
    roleName: "Instructor",
    branchId: "b1",
    branchName: "Dhaka Main",
  },
];

export function UsersRolesTabs() {
  return (
    <Tabs defaultValue="users">
      <TabsList className="w-sm">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <UsersTab users={USERS} />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <RolesTab roles={ROLES} permissions={PERMISSIONS} rolePermissions={ROLE_PERMISSIONS} />
      </TabsContent>

      <TabsContent value="assignments" className="mt-6">
        <RoleAssignmentsTab userRoles={USER_ROLES} users={USERS} roles={ROLES} />
      </TabsContent>
    </Tabs>
  );
}
