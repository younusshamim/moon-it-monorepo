"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Permission, Role, UpdateRole } from "@moonit/schema";
import { Button } from "@moonit/ui/components/button";
import { Checkbox } from "@moonit/ui/components/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@moonit/ui/components/field";
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { errorMessage } from "@/lib/api/error-message";
import { useReplaceRolePermissions, useUpdateRole } from "@/lib/api/mutations/roles";

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  permissionIds: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

export function EditRoleDrawer({
  open,
  onOpenChange,
  role,
  permissions,
  grantedPermissionIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  permissions: Permission[];
  grantedPermissionIds: string[];
}) {
  const updateRole = useUpdateRole();
  const replacePermissions = useReplaceRolePermissions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", permissionIds: [] },
  });

  const permissionIds = watch("permissionIds") ?? [];

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        permissionIds: grantedPermissionIds,
      });
    }
  }, [role, grantedPermissionIds, reset]);

  function togglePermission(id: string) {
    setValue(
      "permissionIds",
      permissionIds.includes(id) ? permissionIds.filter((p) => p !== id) : [...permissionIds, id],
      { shouldDirty: true },
    );
  }

  async function onSubmit(data: FormValues) {
    if (!role) return;
    const input: UpdateRole = { name: data.name };
    try {
      await updateRole.mutateAsync({ id: role.id, input });
      await replacePermissions.mutateAsync({
        roleId: role.id,
        permissionIds: data.permissionIds,
      });
      toast.success("Role updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not update role"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Role</SheetTitle>
          <SheetDescription>Update the role name and adjust its permission set.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-1 flex-col min-h-0"
        >
          <FieldGroup className="flex-1 overflow-y-auto px-4">
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="roleName">Role Name</FieldLabel>
              <Input id="roleName" placeholder="e.g. Accountant" {...register("name")} />
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
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
