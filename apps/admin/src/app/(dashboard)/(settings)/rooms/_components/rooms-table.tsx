"use client";

import { PERMISSIONS, type Room } from "@moonit/schema";
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
import { Monitor, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/session-provider";
import { errorMessage } from "@/lib/api/error-message";
import { useDeleteRoom } from "@/lib/api/mutations/rooms";
import { branchesQueryOptions } from "@/lib/api/queries/branches";
import { roomsQueryOptions } from "@/lib/api/queries/rooms";
import { useActiveBranchStore } from "@/stores/active-branch-store";
import { CreateRoomDrawer } from "./create-room-drawer";
import { EditRoomDrawer } from "./edit-room-drawer";

export interface RoomBranch {
  id: string;
  name: string;
}

export function RoomsTable() {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const canManage = useHasPermission()(PERMISSIONS.ROOM_MANAGE);
  const activeBranchId = useActiveBranchStore((state) => state.activeBranchId);

  const branchesQuery = useQuery(branchesQueryOptions({ pageSize: 100 }));
  const branches: RoomBranch[] = useMemo(
    () => (branchesQuery.data?.data ?? []).map((b) => ({ id: b.id, name: b.name })),
    [branchesQuery.data],
  );
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  // The topbar branch switcher scopes the list; `null` (all branches) fetches everything.
  const { data, isLoading, isError, error } = useQuery(
    roomsQueryOptions({ pageSize: 100, ...(activeBranchId ? { branchId: activeBranchId } : {}) }),
  );
  const deleteRoom = useDeleteRoom();
  const rooms = data?.data ?? [];

  function handleDelete(room: Room) {
    deleteRoom.mutate(room.id, {
      onSuccess: () => toast.success(`Deleted ${room.name}`),
      onError: (err) => toast.error(errorMessage(err, "Could not delete room")),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${rooms.length} rooms`}
        </p>
        {canManage && <CreateRoomDrawer branches={branches} />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Computers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-destructive">
                  {errorMessage(error, "Failed to load rooms")}
                </TableCell>
              </TableRow>
            )}
            {!isError && !isLoading && rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No rooms yet.
                </TableCell>
              </TableRow>
            )}
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium text-sm">{room.name}</TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {branchName.get(room.branchId) ?? "—"}
                </TableCell>

                <TableCell className="text-sm">{room.capacity}</TableCell>

                <TableCell>
                  {room.hasComputers ? (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Monitor className="h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant={room.isActive ? "secondary" : "outline"}>
                    {room.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                        <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(room)}>
                          Delete
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

      <EditRoomDrawer
        open={editingRoom !== null}
        onOpenChange={(v) => {
          if (!v) setEditingRoom(null);
        }}
        room={editingRoom}
        branches={branches}
      />
    </div>
  );
}
