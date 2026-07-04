"use client";

import { PERMISSIONS, type User } from "@moonit/schema";
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
import { useQuery } from "@tanstack/react-query";
import { Check, Minus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useDeactivateUser } from "@/lib/api/mutations/users";
import { usersQueryOptions } from "@/lib/api/queries/users";
import { InviteUserDrawer } from "./invite-user-drawer";

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

export function UsersTab() {
  const canManage = useHasPermission()(PERMISSIONS.USER_MANAGE);
  const { data, isLoading, isError, error } = useQuery(usersQueryOptions({ pageSize: 100 }));
  const deactivateUser = useDeactivateUser();
  const users = data?.data ?? [];

  function handleDeactivate(user: User) {
    deactivateUser.mutate(user.id, {
      onSuccess: () => toast.success(`Suspended ${user.fullName}`),
      onError: (err) => toast.error(errorMessage(err, "Could not suspend user")),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${users.length} users`}
        </p>
        {canManage && <InviteUserDrawer />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-destructive">
                  {errorMessage(error, "Failed to load users")}
                </TableCell>
              </TableRow>
            )}
            {!isError && !isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
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
                  {user.emailVerified ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>

                <TableCell>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={user.status === "suspended"}
                          onClick={() => handleDeactivate(user)}
                        >
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
