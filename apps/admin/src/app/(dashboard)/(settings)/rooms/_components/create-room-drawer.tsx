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
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { RoomBranch } from "./rooms-table";

const schema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  name: z.string().min(1, "Room name is required").max(80),
  capacity: z.number().int("Capacity must be a whole number").min(1, "Capacity must be at least 1"),
  hasComputers: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function CreateRoomDrawer({ branches }: { branches: RoomBranch[] }) {
  const [open, setOpen] = useState(false);

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

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(_data: FormValues) {
    // TODO: call API — room will be created with isActive: true
    // console.log("Create room:", data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Room
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Room</SheetTitle>
            <SheetDescription>
              Add a new room to a branch. The room starts active and can be deactivated later.
            </SheetDescription>
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
                <FieldLabel htmlFor="name">Room Name</FieldLabel>
                <Input id="name" placeholder="e.g. Lab 1" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={errors.capacity ? true : undefined}>
                <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  {...register("capacity", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.capacity]} />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="hasComputers">Has Computers</FieldLabel>
                <Controller
                  name="hasComputers"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasComputers"
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
                Create Room
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
