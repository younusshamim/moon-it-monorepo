"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@moonit/ui/components/button";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  code: z
    .string()
    .min(1, "Body code is required")
    .max(24, "Max 24 characters")
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and dashes, e.g. BTEB"),
  name: z.string().min(1, "Body name is required").max(200),
  website: z.url("Enter a valid URL").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function CreateBodyDrawer() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", website: "" },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(_data: FormValues) {
    // TODO: call API — body will be created with isActive: true
    // console.log("Create affiliation body:", data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Body
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Affiliation Body</SheetTitle>
            <SheetDescription>
              Add a new government or accrediting body. The body starts active and can be
              deactivated later.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.code ? true : undefined}>
                <FieldLabel htmlFor="code">Body Code</FieldLabel>
                <Input id="code" placeholder="e.g. BTEB" {...register("code")} />
                <FieldError errors={[errors.code]} />
              </Field>

              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Body Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Bangladesh Technical Education Board"
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={errors.website ? true : undefined}>
                <FieldLabel htmlFor="website">
                  Website{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.gov.bd"
                  {...register("website")}
                />
                <FieldError errors={[errors.website]} />
              </Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Create Body
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
