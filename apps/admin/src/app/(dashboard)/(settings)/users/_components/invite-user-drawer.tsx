"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { NewUser } from "@moonit/schema";
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
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { errorMessage } from "@/lib/api/error-message";
import { useCreateUser } from "@/lib/api/mutations/users";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function InviteUserDrawer() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "" },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  async function onSubmit(data: FormValues) {
    const input: NewUser = {
      email: data.email,
      fullName: data.fullName,
      phone: data.phone?.trim() || null,
    };
    try {
      await createUser.mutateAsync(input);
      toast.success("Invitation sent");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not invite user"));
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Invite User
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invite User</SheetTitle>
            <SheetDescription>
              The invited user will receive an email to complete sign-up. Their account starts with
              status <strong>invited</strong>.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.fullName ? true : undefined}>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input id="fullName" placeholder="Alice Rahman" {...register("fullName")} />
                <FieldError errors={[errors.fullName]} />
              </Field>

              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="alice@example.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={errors.phone ? true : undefined}>
                <FieldLabel htmlFor="phone">
                  Phone{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="phone" type="tel" placeholder="+8801700000000" {...register("phone")} />
                <FieldError errors={[errors.phone]} />
              </Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Send Invitation
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
