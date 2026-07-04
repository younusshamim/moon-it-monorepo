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
import type { LookupCourse } from "./affiliations-tabs";
import type { DummyBody } from "./bodies-tab";

const schema = z.object({
  affiliationBodyId: z.string().min(1, "Select an affiliation body"),
  courseId: z.string().min(1, "Select a course"),
  title: z.string().min(1, "Title is required").max(200),
  examDate: z.string().optional(),
  registrationOpensAt: z.string().optional(),
  registrationClosesAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CreateEventDrawer({
  bodies,
  courses,
}: {
  bodies: DummyBody[];
  courses: LookupCourse[];
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
      affiliationBodyId: "",
      courseId: "",
      title: "",
      examDate: "",
      registrationOpensAt: "",
      registrationClosesAt: "",
    },
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  function onSubmit(_data: FormValues) {
    // TODO: call API
    // console.log("Create exam event:", data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Event
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Exam Event</SheetTitle>
            <SheetDescription>
              Schedule a new government exam sitting for a course.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 flex flex-1 flex-col min-h-0"
          >
            <FieldGroup className="flex-1 overflow-y-auto px-4">
              <Field data-invalid={errors.affiliationBodyId ? true : undefined}>
                <FieldLabel>Affiliation Body</FieldLabel>
                <Controller
                  name="affiliationBodyId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select body…" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodies.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.affiliationBodyId]} />
              </Field>

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

              <Field data-invalid={errors.title ? true : undefined}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="e.g. BTEB Web Design — June 2026"
                  {...register("title")}
                />
                <FieldError errors={[errors.title]} />
              </Field>

              <Field data-invalid={errors.examDate ? true : undefined}>
                <FieldLabel htmlFor="examDate">
                  Exam Date{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="examDate" type="date" {...register("examDate")} />
                <FieldError errors={[errors.examDate]} />
              </Field>

              <Field data-invalid={errors.registrationOpensAt ? true : undefined}>
                <FieldLabel htmlFor="registrationOpensAt">
                  Registration Opens{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input id="registrationOpensAt" type="date" {...register("registrationOpensAt")} />
                <FieldError errors={[errors.registrationOpensAt]} />
              </Field>

              <Field data-invalid={errors.registrationClosesAt ? true : undefined}>
                <FieldLabel htmlFor="registrationClosesAt">
                  Registration Closes{" "}
                  <span className="font-normal text-muted-foreground text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="registrationClosesAt"
                  type="date"
                  {...register("registrationClosesAt")}
                />
                <FieldError errors={[errors.registrationClosesAt]} />
              </Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                Create Event
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
