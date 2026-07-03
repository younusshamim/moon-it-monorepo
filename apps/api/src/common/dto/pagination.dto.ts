// nestjs-zod DTO wrapper over the shared PaginationQuery contract, for `@Query()` on list endpoints.
// The global ZodValidationPipe coerces + validates against this (see docs/API_AND_AUTH_PLAN.md Phase 0).
import { PaginationQuerySchema } from "@moonit/schema";
import { createZodDto } from "nestjs-zod";

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}
