"use client";

import type { Branch, NewBranch } from "@moonit/schema";
import { Field, FieldError, FieldLabel } from "@moonit/ui/components/field";
import { Input } from "@moonit/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@moonit/ui/components/select";
import { type Control, Controller, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { z } from "zod";

export const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (GMT+5:45)" },
  { value: "Asia/Yangon", label: "Asia/Yangon (GMT+6:30)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
];

export const branchFormSchema = z.object({
  code: z
    .string()
    .min(1, "Branch code is required")
    .max(16, "Max 16 characters")
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and dashes, e.g. DHK-01"),
  name: z.string().min(1, "Branch name is required").max(160),
  addressLine1: z.string().max(240).optional(),
  addressLine2: z.string().max(240).optional(),
  city: z.string().max(80).optional(),
  phone: z.string().max(32).optional(),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

export const branchFormDefaults: BranchFormValues = {
  code: "",
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  phone: "",
  email: "",
  timezone: "Asia/Dhaka",
};

export function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    code: branch.code,
    name: branch.name,
    addressLine1: branch.addressLine1 ?? "",
    addressLine2: branch.addressLine2 ?? "",
    city: branch.city ?? "",
    phone: branch.phone ?? "",
    email: branch.email ?? "",
    timezone: branch.timezone,
  };
}

export function toBranchInput(data: BranchFormValues): NewBranch {
  return {
    code: data.code,
    name: data.name,
    timezone: data.timezone,
    addressLine1: data.addressLine1?.trim() || null,
    addressLine2: data.addressLine2?.trim() || null,
    city: data.city?.trim() || null,
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
  };
}

const OPTIONAL = <span className="font-normal text-muted-foreground text-sm">(optional)</span>;

export function BranchFormFields({
  register,
  control,
  errors,
  idPrefix = "",
}: {
  register: UseFormRegister<BranchFormValues>;
  control: Control<BranchFormValues>;
  errors: FieldErrors<BranchFormValues>;
  idPrefix?: string;
}) {
  const fieldId = (name: string) => `${idPrefix}${name}`;

  return (
    <>
      <Field data-invalid={errors.code ? true : undefined}>
        <FieldLabel htmlFor={fieldId("code")}>Branch Code</FieldLabel>
        <Input id={fieldId("code")} placeholder="e.g. DHK-01" {...register("code")} />
        <FieldError errors={[errors.code]} />
      </Field>

      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor={fieldId("name")}>Branch Name</FieldLabel>
        <Input id={fieldId("name")} placeholder="e.g. Dhaka Main" {...register("name")} />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field data-invalid={errors.addressLine1 ? true : undefined}>
        <FieldLabel htmlFor={fieldId("addressLine1")}>Address Line 1 {OPTIONAL}</FieldLabel>
        <Input
          id={fieldId("addressLine1")}
          placeholder="House, road, area"
          {...register("addressLine1")}
        />
        <FieldError errors={[errors.addressLine1]} />
      </Field>

      <Field data-invalid={errors.addressLine2 ? true : undefined}>
        <FieldLabel htmlFor={fieldId("addressLine2")}>Address Line 2 {OPTIONAL}</FieldLabel>
        <Input
          id={fieldId("addressLine2")}
          placeholder="Suite, floor, etc."
          {...register("addressLine2")}
        />
        <FieldError errors={[errors.addressLine2]} />
      </Field>

      <Field data-invalid={errors.city ? true : undefined}>
        <FieldLabel htmlFor={fieldId("city")}>City {OPTIONAL}</FieldLabel>
        <Input id={fieldId("city")} placeholder="e.g. Dhaka" {...register("city")} />
        <FieldError errors={[errors.city]} />
      </Field>

      <Field data-invalid={errors.phone ? true : undefined}>
        <FieldLabel htmlFor={fieldId("phone")}>Phone {OPTIONAL}</FieldLabel>
        <Input
          id={fieldId("phone")}
          type="tel"
          placeholder="+8801700000000"
          {...register("phone")}
        />
        <FieldError errors={[errors.phone]} />
      </Field>

      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor={fieldId("email")}>Email {OPTIONAL}</FieldLabel>
        <Input
          id={fieldId("email")}
          type="email"
          placeholder="branch@example.com"
          {...register("email")}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={errors.timezone ? true : undefined}>
        <FieldLabel>Timezone</FieldLabel>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone…" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.timezone]} />
      </Field>
    </>
  );
}
