// HTTP edge for the permissions catalog (`/v1/permissions`). List only, bare array. Gated by `permission.read`.
import { PERMISSIONS, type Permission } from "@moonit/schema";
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { RequirePermissions } from "../../../auth/require-permissions.decorator.js";
import { PermissionListDto } from "./dto/permission.dto.js";
import { PermissionsService } from "./permissions.service.js";

@ApiTags("IAM")
@Controller("permissions")
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PERMISSION_READ)
  @ZodSerializerDto(PermissionListDto)
  list(): Promise<Permission[]> {
    return this.service.list();
  }
}
