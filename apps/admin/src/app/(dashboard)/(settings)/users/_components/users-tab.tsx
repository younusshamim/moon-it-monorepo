"use client";

import { Avatar, AvatarFallback } from "@moonit/ui/components/avatar";
import { Badge } from "@moonit/ui/components/badge";
import { Button } from "@moonit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@moonit/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@moonit/ui/components/table";
import { Check, Minus, MoreHorizontal } from "lucide-react";
import { InviteUserDrawer } from "./invite-user-drawer";

export interface DummyUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: "active" | "suspended" | "invited";
  emailVerifiedAt: string | null;
  assignedRoles: string[];
}

const STATUS_VARIANT = {
  active: "secondary",
  suspended: "destructive",
  invited: "outline",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersTab({ users }: { users: DummyUser[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} users</p>
        <InviteUserDrawer />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{initials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{user.phone ?? "—"}</TableCell>

                <TableCell>
                  <Badge variant={STATUS_VARIANT[user.status]} className="capitalize">
                    {user.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {user.emailVerifiedAt ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>

                <TableCell>
                  {user.assignedRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.assignedRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        {user.status === "suspended" ? "Reactivate" : "Suspend"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
