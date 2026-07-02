"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@moonit/ui/components/button";
import { Checkbox } from "@moonit/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@moonit/ui/components/field";
import { Input } from "@moonit/ui/components/input";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DummyPermission } from "./roles-tab";

const schema = z.object({
  key: z
    .string()
    .min(1, "Role key is required")
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase snake_case, e.g. front_desk"),
  name: z.string().min(1, "Role name is required"),
  permissionIds: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

export function CreateRoleDrawer({ permissions }: { permissions: DummyPermission[] }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { key: "", name: "", permissionIds: [] },
  });

  const permissionIds = watch("permissionIds") ?? [];

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function togglePermission(id: string) {
    setValue(
      "permissionIds",
      permissionIds.includes(id) ? permissionIds.filter((p) => p !== id) : [...permissionIds, id],
      { shouldDirty: true },
    );
  }

  function onSubmit(_data: FormValues) {
    // TODO: call API — role will be created with isSystem: false
    // console.log("Create role:", data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Role
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Role</SheetTitle>
            <SheetDescription>
              Define a custom role and grant it a set of permissions. System roles cannot be created
              here.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.key ? true : undefined}>
                <FieldLabel htmlFor="roleKey">Key</FieldLabel>
                <Input id="roleKey" placeholder="e.g. front_desk" {...register("key")} />
                <FieldDescription>Unique identifier, lowercase snake_case.</FieldDescription>
                <FieldError errors={[errors.key]} />
              </Field>

              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="roleName">Role Name</FieldLabel>
                <Input id="roleName" placeholder="e.g. Front Desk" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Permissions</FieldLabel>
                <div className="mt-2 flex flex-col gap-3">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={permissionIds.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col gap-0.5">
                        <code className="text-xs font-mono leading-none">{perm.key}</code>
                        <span className="text-xs text-muted-foreground">{perm.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Create Role
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
