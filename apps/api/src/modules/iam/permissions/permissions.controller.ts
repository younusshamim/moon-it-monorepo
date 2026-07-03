// HTTP edge for the permissions catalog (`/v1/permissions`). List only, bare array. Unprotected — Phase 6.
import type { Permission } from "@moonit/schema";
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { PermissionListDto } from "./dto/permission.dto.js";
import { PermissionsService } from "./permissions.service.js";

@ApiTags("IAM")
@Controller("permissions")
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @ZodSerializerDto(PermissionListDto)
  list(): Promise<Permission[]> {
    return this.service.list();
  }
}
