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
import type { LookupCourse } from "./affiliations-tabs";
import type { DummyBody } from "./bodies-tab";
import { CreateEventDrawer } from "./create-event-drawer";
import { EditEventDrawer } from "./edit-event-drawer";

export interface DummyEvent {
  id: string;
  affiliationBodyId: string;
  courseId: string;
  title: string;
  examDate: string | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  resultPublishedAt: string | null;
}

export function EventsTab({
  events,
  bodies,
  courses,
}: {
  events: DummyEvent[];
  bodies: DummyBody[];
  courses: LookupCourse[];
}) {
  const [editingEvent, setEditingEvent] = useState<DummyEvent | null>(null);

  function bodyLabel(bodyId: string) {
    return bodies.find((b) => b.id === bodyId)?.code ?? "—";
  }

  function courseLabel(courseId: string) {
    return courses.find((c) => c.id === courseId)?.title ?? "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{events.length} exam events</p>
        <CreateEventDrawer bodies={bodies} courses={courses} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Body / Course</TableHead>
              <TableHead>Exam Date</TableHead>
              <TableHead>Registration Window</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium text-sm">{event.title}</TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <Badge variant="outline" className="w-fit text-xs">
                      {bodyLabel(event.affiliationBodyId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {courseLabel(event.courseId)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {event.examDate ?? "—"}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {event.registrationOpensAt ?? "—"} – {event.registrationClosesAt ?? "—"}
                </TableCell>

                <TableCell>
                  {event.resultPublishedAt ? (
                    <Badge variant="secondary" className="text-xs">
                      Published {event.resultPublishedAt}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Pending</span>
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
                      <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditEventDrawer
        open={editingEvent !== null}
        onOpenChange={(v) => {
          if (!v) setEditingEvent(null);
        }}
        event={editingEvent}
        bodies={bodies}
        courses={courses}
      />
    </div>
  );
}
