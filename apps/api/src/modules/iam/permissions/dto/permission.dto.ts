// nestjs-zod DTOs for the permissions endpoint. The catalog is a small fixed reference set, so the
// list returns a bare array (not a page envelope) per the plan's envelope decision. Read-only in this
// phase — the catalog is seeded (docs/API_AND_AUTH_PLAN.md, Phase 2 & Resolved decision #2).
import { PermissionSchema } from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/** Single-permission response. */
export class PermissionDto extends createZodDto(PermissionSchema) {}
/** Bare-array list response. */
export class PermissionListDto extends createZodDto(z.array(PermissionSchema)) {}
