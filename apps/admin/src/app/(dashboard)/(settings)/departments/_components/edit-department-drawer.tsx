"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Department, UpdateDepartment } from "@moonit/schema";
import { Button } from "@moonit/ui/components/button";
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
import { toast } from "sonner";
import { z } from "zod";
import { errorMessage } from "@/lib/api/error-message";
import { useUpdateDepartment } from "@/lib/api/mutations/departments";
import { INSTITUTE_WIDE } from "./create-department-drawer";
import type { DepartmentBranch } from "./departments-table";

const schema = z.object({
  name: z.string().min(1, "Department name is required").max(120),
  branchId: z.string().min(1, "Select a branch scope"),
});
type FormValues = z.infer<typeof schema>;

export function EditDepartmentDrawer({
  open,
  onOpenChange,
  department,
  branches,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  branches: DepartmentBranch[];
}) {
  const updateDepartment = useUpdateDepartment();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", branchId: INSTITUTE_WIDE },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        branchId: department.branchId ?? INSTITUTE_WIDE,
      });
    }
  }, [department, reset]);

  async function onSubmit(data: FormValues) {
    if (!department) return;
    const input: UpdateDepartment = {
      name: data.name,
      branchId: data.branchId === INSTITUTE_WIDE ? null : data.branchId,
    };
    try {
      await updateDepartment.mutateAsync({ id: department.id, input });
      toast.success("Department updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not update department"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Department</SheetTitle>
          <SheetDescription>Update the department name and branch scope.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-1 flex-col min-h-0"
        >
          <FieldGroup className="flex-1 overflow-y-auto px-4">
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="editDepartmentName">Department Name</FieldLabel>
              <Input id="editDepartmentName" placeholder="e.g. IT" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.branchId ? true : undefined}>
              <FieldLabel>Branch Scope</FieldLabel>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch scope…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={INSTITUTE_WIDE}>Institute-wide</SelectItem>
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
