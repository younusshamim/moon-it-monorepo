"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@moonit/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@moonit/ui/components/field";
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

const BRANCHES = [
  { id: "b1", name: "Dhaka Main" },
  { id: "b2", name: "Chittagong" },
  { id: "b3", name: "Sylhet" },
];

const ALL_BRANCHES = "__all__";

const schema = z.object({
  userId: z.string().min(1, "Select a user"),
  roleId: z.string().min(1, "Select a role"),
  branchId: z.string().min(1, "Select a branch scope"),
});
type FormValues = z.infer<typeof schema>;

export interface AssignableUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AssignableRole {
  id: string;
  name: string;
}

export function AssignRoleDrawer({
  users,
  roles,
}: {
  users: AssignableUser[];
  roles: AssignableRole[];
}) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "", roleId: "", branchId: "" },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(data: FormValues) {
    const branchId = data.branchId === ALL_BRANCHES ? null : data.branchId;
    // TODO: call API
    // console.log("Assign role:", { ...data, branchId });
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Assign Role
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Assign Role</SheetTitle>
            <SheetDescription>
              Grant a role to a user. Choose <strong>All Branches</strong> to give super-admin
              scope, or restrict to a specific branch.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.userId ? true : undefined}>
                <FieldLabel>User</FieldLabel>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user…" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <span>{u.fullName}</span>
                            <span className="ml-1.5 text-xs text-muted-foreground">{u.email}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.userId]} />
              </Field>

              <Field data-invalid={errors.roleId ? true : undefined}>
                <FieldLabel>Role</FieldLabel>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role…" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.roleId]} />
              </Field>

              <Field data-invalid={errors.branchId ? true : undefined}>
                <FieldLabel>Branch Scope</FieldLabel>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch scope…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_BRANCHES}>All Branches</SelectItem>
                        {BRANCHES.map((b) => (
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
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Assign Role
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
