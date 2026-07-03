// nestjs-zod DTOs for the branches endpoints. Bodies wrap the `New`/`Update` create contracts and
// responses wrap the canonical entity schema (single row + paginated envelope), so the global
// ZodValidationPipe / ZodSerializerInterceptor validate against @moonit/schema — no field shapes are
// re-declared here (docs/API_AND_AUTH_PLAN.md, Phase 1 Conventions).
import { BranchSchema, NewBranchSchema, paginated, UpdateBranchSchema } from "@moonit/schema";
import { createZodDto } from "nestjs-zod";

export class CreateBranchDto extends createZodDto(NewBranchSchema) {}
export class UpdateBranchDto extends createZodDto(UpdateBranchSchema) {}

/** Single-branch response. */
export class BranchDto extends createZodDto(BranchSchema) {}
/** Paginated list response: `{ data, page, pageSize, total }`. */
export class BranchPageDto extends createZodDto(paginated(BranchSchema)) {}
