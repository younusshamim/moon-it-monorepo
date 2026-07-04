"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { NewDepartment } from "@moonit/schema";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { errorMessage } from "@/lib/api/error-message";
import { useCreateDepartment } from "@/lib/api/mutations/departments";
import type { DepartmentBranch } from "./departments-table";

export const INSTITUTE_WIDE = "__institute_wide__";

const schema = z.object({
  name: z.string().min(1, "Department name is required").max(120),
  branchId: z.string().min(1, "Select a branch scope"),
});
type FormValues = z.infer<typeof schema>;

export function CreateDepartmentDrawer({ branches }: { branches: DepartmentBranch[] }) {
  const [open, setOpen] = useState(false);
  const createDepartment = useCreateDepartment();

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

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  async function onSubmit(data: FormValues) {
    const input: NewDepartment = {
      name: data.name,
      branchId: data.branchId === INSTITUTE_WIDE ? null : data.branchId,
    };
    try {
      await createDepartment.mutateAsync(input);
      toast.success("Department created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not create department"));
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Department</SheetTitle>
            <SheetDescription>
              Add a new department. Choose <strong>Institute-wide</strong> if it isn't tied to a
              single branch, or scope it to a specific branch.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Department Name</FieldLabel>
                <Input id="name" placeholder="e.g. IT" {...register("name")} />
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
                Create Department
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
