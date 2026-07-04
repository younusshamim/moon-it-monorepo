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
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { DummyRegistration, RegistrationStatus } from "./registrations-tab";

const STATUS_OPTIONS: { value: RegistrationStatus; label: string }[] = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "registered", label: "Registered" },
  { value: "admit_issued", label: "Admit Issued" },
  { value: "appeared", label: "Appeared" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "absent", label: "Absent" },
  { value: "cancelled", label: "Cancelled" },
];

const schema = z.object({
  status: z.enum([
    "pending_payment",
    "registered",
    "admit_issued",
    "appeared",
    "passed",
    "failed",
    "absent",
    "cancelled",
  ]),
  boardRollNumber: z.string().max(48).optional(),
  boardRegistrationNumber: z.string().max(48).optional(),
  resultGrade: z.string().max(16).optional(),
  resultMarks: z.string().max(16).optional(),
  registeredAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function EditRegistrationDrawer({
  open,
  onOpenChange,
  registration,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: DummyRegistration | null;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "pending_payment",
      boardRollNumber: "",
      boardRegistrationNumber: "",
      resultGrade: "",
      resultMarks: "",
      registeredAt: "",
    },
  });

  useEffect(() => {
    if (registration) {
      reset({
        status: registration.status,
        boardRollNumber: registration.boardRollNumber ?? "",
        boardRegistrationNumber: registration.boardRegistrationNumber ?? "",
        resultGrade: registration.resultGrade ?? "",
        resultMarks: registration.resultMarks ?? "",
        registeredAt: registration.registeredAt ?? "",
      });
    }
  }, [registration, reset]);

  function onSubmit(_data: FormValues) {
    // TODO: call API
    // console.log("Edit registration:", { registrationId: registration?.id, ...data });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Registration</SheetTitle>
          <SheetDescription>Update the registration status and exam result.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-1 flex-col min-h-0"
        >
          <FieldGroup className="flex-1 overflow-y-auto px-4">
            <Field data-invalid={errors.status ? true : undefined}>
              <FieldLabel>Status</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status…" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>

            <Field data-invalid={errors.registeredAt ? true : undefined}>
              <FieldLabel htmlFor="registeredAt">
                Registered At{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input id="registeredAt" type="date" {...register("registeredAt")} />
              <FieldError errors={[errors.registeredAt]} />
            </Field>

            <Field data-invalid={errors.boardRollNumber ? true : undefined}>
              <FieldLabel htmlFor="boardRollNumber">
                Board Roll Number{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input
                id="boardRollNumber"
                placeholder="e.g. 112233"
                {...register("boardRollNumber")}
              />
              <FieldError errors={[errors.boardRollNumber]} />
            </Field>

            <Field data-invalid={errors.boardRegistrationNumber ? true : undefined}>
              <FieldLabel htmlFor="boardRegistrationNumber">
                Board Registration Number{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input
                id="boardRegistrationNumber"
                placeholder="e.g. REG-0098"
                {...register("boardRegistrationNumber")}
              />
              <FieldError errors={[errors.boardRegistrationNumber]} />
            </Field>

            <Field data-invalid={errors.resultGrade ? true : undefined}>
              <FieldLabel htmlFor="resultGrade">
                Result Grade{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input id="resultGrade" placeholder="e.g. A" {...register("resultGrade")} />
              <FieldError errors={[errors.resultGrade]} />
            </Field>

            <Field data-invalid={errors.resultMarks ? true : undefined}>
              <FieldLabel htmlFor="resultMarks">
                Result Marks{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input id="resultMarks" placeholder="e.g. 82.50" {...register("resultMarks")} />
              <FieldError errors={[errors.resultMarks]} />
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
