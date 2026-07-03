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
import type { LookupBranch, LookupStudent } from "./affiliations-tabs";
import type { DummyEvent } from "./events-tab";

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  examEventId: z.string().min(1, "Select an exam event"),
  branchId: z.string().min(1, "Select a branch"),
});
type FormValues = z.infer<typeof schema>;

export function CreateRegistrationDrawer({
  events,
  students,
  branches,
}: {
  events: DummyEvent[];
  students: LookupStudent[];
  branches: LookupBranch[];
}) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: "", examEventId: "", branchId: "" },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(_data: FormValues) {
    // TODO: call API — registration will be created with status: "pending_payment"
    // console.log("Register student:", data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Register Student
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Register Student</SheetTitle>
            <SheetDescription>
              Register a student for a government exam event. The registration starts as{" "}
              <strong>Pending Payment</strong>.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.studentId ? true : undefined}>
                <FieldLabel>Student</FieldLabel>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select student…" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <span>{s.fullName}</span>
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              {s.studentCode}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.studentId]} />
              </Field>

              <Field data-invalid={errors.examEventId ? true : undefined}>
                <FieldLabel>Exam Event</FieldLabel>
                <Controller
                  name="examEventId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select exam event…" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.examEventId]} />
              </Field>

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
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Register Student
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
