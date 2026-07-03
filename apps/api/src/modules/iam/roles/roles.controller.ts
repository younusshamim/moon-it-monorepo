// HTTP edge for roles (`/v1/roles`). List is a bare array (small fixed set). System roles are read-only
// (service throws 403). `PUT /roles/:id/permissions` replaces the grant set. Unprotected — Phase 6.
import type { Permission, Role } from "@moonit/schema";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateRoleDto,
  ReplaceRolePermissionsDto,
  RoleDto,
  RoleListDto,
  RolePermissionsDto,
  UpdateRoleDto,
} from "./dto/role.dto.js";
import { RolesService } from "./roles.service.js";

@ApiTags("IAM")
@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ZodSerializerDto(RoleListDto)
  list(): Promise<Role[]> {
    return this.service.list();
  }

  @Get(":id")
  @ZodSerializerDto(RoleDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Role> {
    return this.service.getById(id);
  }

  @Post()
  @ZodSerializerDto(RoleDto)
  create(@Body() body: CreateRoleDto): Promise<Role> {
    return this.service.create(body);
  }

  @Patch(":id")
  @ZodSerializerDto(RoleDto)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateRoleDto): Promise<Role> {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get(":id/permissions")
  @ZodSerializerDto(RolePermissionsDto)
  listPermissions(@Param("id", ParseUUIDPipe) id: string): Promise<Permission[]> {
    return this.service.listPermissions(id);
  }

  @Put(":id/permissions")
  @ZodSerializerDto(RolePermissionsDto)
  replacePermissions(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ReplaceRolePermissionsDto,
  ): Promise<Permission[]> {
    return this.service.replacePermissions(id, body.permissionIds);
  }
}
