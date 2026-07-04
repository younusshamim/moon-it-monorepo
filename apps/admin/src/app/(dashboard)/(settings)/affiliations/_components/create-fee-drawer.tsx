"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";
import type { LookupBranch, LookupCourse } from "./affiliations-tabs";

export const ALL_BRANCHES = "__all__";

const schema = z.object({
  courseId: z.string().min(1, "Select a course"),
  branchId: z.string().min(1, "Select a branch scope"),
  registrationFee: z.number().min(0, "Fee must be zero or greater"),
  currency: z.string().min(1, "Currency is required").max(3, "Use a 3-letter currency code"),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CreateFeeDrawer({
  courses,
  branches,
}: {
  courses: LookupCourse[];
  branches: LookupBranch[];
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseId: "",
      branchId: ALL_BRANCHES,
      registrationFee: 0,
      currency: "BDT",
      validFrom: "",
      validTo: "",
    },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(data: FormValues) {
    const _branchId = data.branchId === ALL_BRANCHES ? null : data.branchId;
    // TODO: call API — fee will be created with isActive: true
    // console.log("Create exam fee:", { ...data, branchId });
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Fee
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Exam Fee</SheetTitle>
            <SheetDescription>
              Set a government exam registration fee for a course. Choose{" "}
              <strong>All Branches</strong> for an institute-wide fee, or restrict to one branch.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.courseId ? true : undefined}>
                <FieldLabel>Course</FieldLabel>
                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select course…" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.courseId]} />
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
                        <SelectItem value={ALL_BRANCHES}>All Branches</SelectItem>
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

              <Field data-invalid={errors.registrationFee ? true : undefined}>
                <FieldLabel htmlFor="registrationFee">Registration Fee</FieldLabel>
                <Input
                  id="registrationFee"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 1500"
                  {...register("registrationFee", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.registrationFee]} />
              </Field>

              <Field data-invalid={errors.currency ? true : undefined}>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>
                <Input id="currency" placeholder="BDT" {...register("currency")} />
                <FieldError errors={[errors.currency]} />
              </Field>

              <Field data-invalid={errors.validFrom ? true : undefined}>
                <FieldLabel htmlFor="validFrom">
                  Valid From{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="validFrom" type="date" {...register("validFrom")} />
                <FieldError errors={[errors.validFrom]} />
              </Field>

              <Field data-invalid={errors.validTo ? true : undefined}>
                <FieldLabel htmlFor="validTo">
                  Valid To{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="validTo" type="date" {...register("validTo")} />
                <FieldError errors={[errors.validTo]} />
              </Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Create Fee
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
