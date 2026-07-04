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
import { CreateBodyDrawer } from "./create-body-drawer";
import { EditBodyDrawer } from "./edit-body-drawer";

export interface DummyBody {
  id: string;
  code: string;
  name: string;
  website: string | null;
  isActive: boolean;
}

export function BodiesTab({ bodies }: { bodies: DummyBody[] }) {
  const [editingBody, setEditingBody] = useState<DummyBody | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{bodies.length} affiliation bodies</p>
        <CreateBodyDrawer />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Body</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bodies.map((body) => (
              <TableRow key={body.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{body.name}</span>
                    <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {body.code}
                    </code>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {body.website ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge variant={body.isActive ? "secondary" : "outline"}>
                    {body.isActive ? "Active" : "Inactive"}
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
                      <DropdownMenuItem onClick={() => setEditingBody(body)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        {body.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBodyDrawer
        open={editingBody !== null}
        onOpenChange={(v) => {
          if (!v) setEditingBody(null);
        }}
        body={editingBody}
      />
    </div>
  );
}
