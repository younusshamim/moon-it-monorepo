"use client";

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
import { Monitor, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CreateRoomDrawer } from "./create-room-drawer";
import { EditRoomDrawer } from "./edit-room-drawer";

export interface RoomBranch {
  id: string;
  name: string;
}

export interface DummyRoom {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  capacity: number;
  hasComputers: boolean;
  isActive: boolean;
}

export const BRANCHES: RoomBranch[] = [
  { id: "b1", name: "Dhaka Main" },
  { id: "b2", name: "Chittagong" },
  { id: "b3", name: "Sylhet" },
  { id: "b4", name: "Rajshahi" },
];

const ROOMS: DummyRoom[] = [
  {
    id: "rm1",
    branchId: "b1",
    branchName: "Dhaka Main",
    name: "Lab 1",
    capacity: 30,
    hasComputers: true,
    isActive: true,
  },
  {
    id: "rm2",
    branchId: "b1",
    branchName: "Dhaka Main",
    name: "Room 204",
    capacity: 40,
    hasComputers: false,
    isActive: true,
  },
  {
    id: "rm3",
    branchId: "b2",
    branchName: "Chittagong",
    name: "Lab 2",
    capacity: 25,
    hasComputers: true,
    isActive: true,
  },
  {
    id: "rm4",
    branchId: "b3",
    branchName: "Sylhet",
    name: "Room 101",
    capacity: 20,
    hasComputers: false,
    isActive: false,
  },
];

export function RoomsTable() {
  const [editingRoom, setEditingRoom] = useState<DummyRoom | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ROOMS.length} rooms</p>
        <CreateRoomDrawer branches={BRANCHES} />
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
            {ROOMS.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium text-sm">{room.name}</TableCell>

                <TableCell className="text-sm text-muted-foreground">{room.branchName}</TableCell>

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingRoom(room)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        {room.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        branches={BRANCHES}
      />
    </div>
  );
}
