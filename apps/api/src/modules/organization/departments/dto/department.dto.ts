// nestjs-zod DTOs for the departments endpoints. `branchId` is nullable on the entity (null =
// institute-wide); the list query adds an optional `branchId` filter, applied only when provided.
import {
  DepartmentSchema,
  NewDepartmentSchema,
  PaginationQuerySchema,
  paginated,
  UpdateDepartmentSchema,
} from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateDepartmentDto extends createZodDto(NewDepartmentSchema) {}
export class UpdateDepartmentDto extends createZodDto(UpdateDepartmentSchema) {}

/** Single-department response. */
export class DepartmentDto extends createZodDto(DepartmentSchema) {}
/** Paginated list response. */
export class DepartmentPageDto extends createZodDto(paginated(DepartmentSchema)) {}

/** List query schema: pagination plus an optional `branchId` filter. */
const DepartmentListQuerySchema = PaginationQuerySchema.extend({ branchId: z.uuid().optional() });
export class DepartmentListQueryDto extends createZodDto(DepartmentListQuerySchema) {}
export type DepartmentListQuery = z.infer<typeof DepartmentListQuerySchema>;
