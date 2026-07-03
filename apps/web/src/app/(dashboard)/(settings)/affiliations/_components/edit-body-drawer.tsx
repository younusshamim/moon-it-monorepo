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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DummyBody } from "./bodies-tab";

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

export function EditBodyDrawer({
  open,
  onOpenChange,
  body,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: DummyBody | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", website: "" },
  });

  useEffect(() => {
    if (body) {
      reset({ code: body.code, name: body.name, website: body.website ?? "" });
    }
  }, [body, reset]);

  function onSubmit(_data: FormValues) {
    // TODO: call API
    // console.log("Edit affiliation body:", { bodyId: body?.id, ...data });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Affiliation Body</SheetTitle>
          <SheetDescription>Update the affiliation body's details.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-1 flex-col min-h-0"
        >
          <FieldGroup className="flex-1 overflow-y-auto px-4">
            <Field data-invalid={errors.code ? true : undefined}>
              <FieldLabel htmlFor="editCode">Body Code</FieldLabel>
              <Input id="editCode" placeholder="e.g. BTEB" {...register("code")} />
              <FieldError errors={[errors.code]} />
            </Field>

            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="editName">Body Name</FieldLabel>
              <Input
                id="editName"
                placeholder="e.g. Bangladesh Technical Education Board"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.website ? true : undefined}>
              <FieldLabel htmlFor="editWebsite">
                Website{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </FieldLabel>
              <Input
                id="editWebsite"
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
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
