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
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CreateBranchDrawer } from "./create-branch-drawer";
import { EditBranchDrawer } from "./edit-branch-drawer";

export interface DummyBranch {
  id: string;
  code: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  isActive: boolean;
}

export const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (GMT+5:45)" },
  { value: "Asia/Yangon", label: "Asia/Yangon (GMT+6:30)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
];

const BRANCHES: DummyBranch[] = [
  {
    id: "b1",
    code: "DHK-01",
    name: "Dhaka Main",
    addressLine1: "House 12, Road 5, Dhanmondi",
    addressLine2: null,
    city: "Dhaka",
    phone: "+8802-9611001",
    email: "dhaka.main@moonit.example",
    timezone: "Asia/Dhaka",
    isActive: true,
  },
  {
    id: "b2",
    code: "CTG-01",
    name: "Chittagong",
    addressLine1: "GEC Circle",
    addressLine2: null,
    city: "Chattogram",
    phone: "+8801700000010",
    email: "chittagong@moonit.example",
    timezone: "Asia/Dhaka",
    isActive: true,
  },
  {
    id: "b3",
    code: "SYL-01",
    name: "Sylhet",
    addressLine1: null,
    addressLine2: null,
    city: "Sylhet",
    phone: null,
    email: "sylhet@moonit.example",
    timezone: "Asia/Dhaka",
    isActive: true,
  },
  {
    id: "b4",
    code: "RAJ-01",
    name: "Rajshahi",
    addressLine1: "Shaheb Bazar",
    addressLine2: null,
    city: "Rajshahi",
    phone: "+8801700000040",
    email: null,
    timezone: "Asia/Dhaka",
    isActive: false,
  },
];

export function BranchesTable() {
  const [editingBranch, setEditingBranch] = useState<DummyBranch | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{BRANCHES.length} branches</p>
        <CreateBranchDrawer />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {BRANCHES.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{branch.name}</span>
                    <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {branch.code}
                    </code>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span>{branch.city ?? "—"}</span>
                    {branch.addressLine1 && (
                      <span className="text-xs text-muted-foreground">{branch.addressLine1}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span>{branch.phone ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{branch.email ?? "—"}</span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{branch.timezone}</TableCell>

                <TableCell>
                  <Badge variant={branch.isActive ? "secondary" : "outline"}>
                    {branch.isActive ? "Active" : "Inactive"}
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
                      <DropdownMenuItem onClick={() => setEditingBranch(branch)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        {branch.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBranchDrawer
        open={editingBranch !== null}
        onOpenChange={(v) => {
          if (!v) setEditingBranch(null);
        }}
        branch={editingBranch}
      />
    </div>
  );
}
