"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@moonit/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDrawer } from "@/components/form-drawer";
import { applyApiErrorToForm } from "@/lib/api/form-errors";
import { useCreateBranch } from "@/lib/api/mutations/branches";
import {
  BranchFormFields,
  type BranchFormValues,
  branchFormDefaults,
  branchFormSchema,
  toBranchInput,
} from "./branch-form";

export function CreateBranchDrawer() {
  const [open, setOpen] = useState(false);
  const createBranch = useCreateBranch();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: branchFormDefaults,
  });

  function onOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  async function onSubmit(data: BranchFormValues) {
    try {
      await createBranch.mutateAsync(toBranchInput(data));
      toast.success("Branch created");
      reset();
      setOpen(false);
    } catch (error) {
      // Map server-side field issues onto the inputs; non-field errors are already toasted globally.
      applyApiErrorToForm(error, setError);
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create Branch"
      description="Add a new institute branch. The branch starts active and can be deactivated later."
      trigger={
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Create Branch"
      isSubmitting={isSubmitting}
    >
      <BranchFormFields register={register} control={control} errors={errors} idPrefix="create-" />
    </FormDrawer>
  );
}
