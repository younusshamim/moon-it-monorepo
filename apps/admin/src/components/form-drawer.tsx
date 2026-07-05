"use client";

import { Button } from "@moonit/ui/components/button";
import { FieldGroup } from "@moonit/ui/components/field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@moonit/ui/components/sheet";
import type { FormEventHandler, ReactNode } from "react";

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Rendered as the Sheet trigger (create case). Omit for an externally-controlled drawer (edit case). */
  trigger?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  isSubmitting?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-1 flex-col min-h-0">
          <FieldGroup className="flex-1 overflow-y-auto px-4">{children}</FieldGroup>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
