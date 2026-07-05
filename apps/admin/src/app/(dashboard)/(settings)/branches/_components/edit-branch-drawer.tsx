"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Branch } from "@moonit/schema";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDrawer } from "@/components/form-drawer";
import { applyApiErrorToForm } from "@/lib/api/form-errors";
import { useUpdateBranch } from "@/lib/api/mutations/branches";
import {
  BranchFormFields,
  type BranchFormValues,
  branchFormDefaults,
  branchFormSchema,
  branchToFormValues,
  toBranchInput,
} from "./branch-form";

export function EditBranchDrawer({
  open,
  onOpenChange,
  branch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
}) {
  const updateBranch = useUpdateBranch();

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

  useEffect(() => {
    if (branch) reset(branchToFormValues(branch));
  }, [branch, reset]);

  async function onSubmit(data: BranchFormValues) {
    if (!branch) return;
    try {
      await updateBranch.mutateAsync({ id: branch.id, input: toBranchInput(data) });
      toast.success("Branch updated");
      onOpenChange(false);
    } catch (error) {
      applyApiErrorToForm(error, setError);
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Branch"
      description="Update the branch details and contact information."
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
    >
      <BranchFormFields register={register} control={control} errors={errors} idPrefix="edit-" />
    </FormDrawer>
  );
}
