"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@moonit/ui/components/button";
import { Checkbox } from "@moonit/ui/components/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@moonit/ui/components/field";
import { Input } from "@moonit/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@moonit/ui/components/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@moonit/ui/components/sheet";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { DummyRoom, RoomBranch } from "./rooms-table";

const schema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  name: z.string().min(1, "Room name is required").max(80),
  capacity: z.number().int("Capacity must be a whole number").min(1, "Capacity must be at least 1"),
  hasComputers: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function EditRoomDrawer({
  open,
  onOpenChange,
  room,
  branches,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: DummyRoom | null;
  branches: RoomBranch[];
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { branchId: "", name: "", capacity: 1, hasComputers: false },
  });

  useEffect(() => {
    if (room) {
      reset({
        branchId: room.branchId,
        name: room.name,
        capacity: room.capacity,
        hasComputers: room.hasComputers,
      });
    }
  }, [room, reset]);

  function onSubmit(_data: FormValues) {
    // TODO: call API
    // console.log("Edit room:", { roomId: room?.id, ...data });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Room</SheetTitle>
          <SheetDescription>Update the room's branch, capacity, and equipment.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-1 flex-col min-h-0"
        >
          <FieldGroup className="flex-1 overflow-y-auto px-4">
            <Field data-invalid={errors.branchId ? true : undefined}>
              <FieldLabel>Branch</FieldLabel>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch…" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.branchId]} />
            </Field>

            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="editRoomName">Room Name</FieldLabel>
              <Input id="editRoomName" placeholder="e.g. Lab 1" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.capacity ? true : undefined}>
              <FieldLabel htmlFor="editCapacity">Capacity</FieldLabel>
              <Input
                id="editCapacity"
                type="number"
                min={1}
                placeholder="e.g. 30"
                {...register("capacity", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="editHasComputers">Has Computers</FieldLabel>
              <Controller
                name="hasComputers"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="editHasComputers"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Field>
          </FieldGroup>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
