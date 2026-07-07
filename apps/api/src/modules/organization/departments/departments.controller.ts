// HTTP edge for departments (`/v1/departments`). List is filterable by `branchId`.
// `department.read`/`department.manage` gate the routes; the AuthzContext threads in for branch scoping.
import { type Department, type Paginated, PERMISSIONS } from "@moonit/schema";
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
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { Authz } from "../../../auth/authz.decorator.js";
import type { AuthzContext } from "../../../auth/authz-context.js";
import { CurrentUser } from "../../../auth/current-user.decorator.js";
import { RequirePermissions } from "../../../auth/require-permissions.decorator.js";
import type { SessionUser } from "../../../auth/session-user.js";
import { DepartmentsService } from "./departments.service.js";
import {
  CreateDepartmentDto,
  DepartmentDto,
  DepartmentListQueryDto,
  DepartmentPageDto,
  UpdateDepartmentDto,
} from "./dto/department.dto.js";

@ApiTags("Organization")
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.DEPARTMENT_READ)
  @ZodSerializerDto(DepartmentPageDto)
  list(@Query() query: DepartmentListQueryDto): Promise<Paginated<Department>> {
    return this.service.list(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.DEPARTMENT_READ)
  @ZodSerializerDto(DepartmentDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Department> {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.DEPARTMENT_MANAGE)
  @ZodSerializerDto(DepartmentDto)
  create(
    @Body() body: CreateDepartmentDto,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<Department> {
    return this.service.create(body, authz, user.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.DEPARTMENT_MANAGE)
  @ZodSerializerDto(DepartmentDto)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateDepartmentDto,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<Department> {
    return this.service.update(id, body, authz, user.id);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.DEPARTMENT_MANAGE)
  @HttpCode(204)
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<void> {
    return this.service.remove(id, authz, user.id);
  }
}
