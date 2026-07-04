"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { NewBranch } from "@moonit/schema";
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
import { useCreateBranch } from "@/lib/api/mutations/branches";
import { TIMEZONES } from "./branches-table";

const schema = z.object({
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
type FormValues = z.infer<typeof schema>;

function toInput(data: FormValues): NewBranch {
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

export function CreateBranchDrawer() {
  const [open, setOpen] = useState(false);
  const createBranch = useCreateBranch();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      phone: "",
      email: "",
      timezone: "Asia/Dhaka",
    },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  async function onSubmit(data: FormValues) {
    try {
      await createBranch.mutateAsync(toInput(data));
      toast.success("Branch created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not create branch"));
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Branch
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Branch</SheetTitle>
            <SheetDescription>
              Add a new institute branch. The branch starts active and can be deactivated later.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.code ? true : undefined}>
                <FieldLabel htmlFor="code">Branch Code</FieldLabel>
                <Input id="code" placeholder="e.g. DHK-01" {...register("code")} />
                <FieldError errors={[errors.code]} />
              </Field>

              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Branch Name</FieldLabel>
                <Input id="name" placeholder="e.g. Dhaka Main" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={errors.addressLine1 ? true : undefined}>
                <FieldLabel htmlFor="addressLine1">
                  Address Line 1{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="addressLine1"
                  placeholder="House, road, area"
                  {...register("addressLine1")}
                />
                <FieldError errors={[errors.addressLine1]} />
              </Field>

              <Field data-invalid={errors.addressLine2 ? true : undefined}>
                <FieldLabel htmlFor="addressLine2">
                  Address Line 2{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="addressLine2"
                  placeholder="Suite, floor, etc."
                  {...register("addressLine2")}
                />
                <FieldError errors={[errors.addressLine2]} />
              </Field>

              <Field data-invalid={errors.city ? true : undefined}>
                <FieldLabel htmlFor="city">
                  City <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="city" placeholder="e.g. Dhaka" {...register("city")} />
                <FieldError errors={[errors.city]} />
              </Field>

              <Field data-invalid={errors.phone ? true : undefined}>
                <FieldLabel htmlFor="phone">
                  Phone{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="phone" type="tel" placeholder="+8801700000000" {...register("phone")} />
                <FieldError errors={[errors.phone]} />
              </Field>

              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">
                  Email{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="email"
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
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Create Branch
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
