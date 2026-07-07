// HTTP edge for users (`/v1/users`). CRUD plus deactivate, and branch-scoped role assignment nested
// under the user. No DELETE — users are deactivated, not removed. `user.read`/`user.manage` gate the
// routes; role assignment threads the AuthzContext for branch scoping.
import { type Paginated, PERMISSIONS, type User, type UserRole } from "@moonit/schema";
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { Authz } from "../../../auth/authz.decorator.js";
import type { AuthzContext } from "../../../auth/authz-context.js";
import { CurrentUser } from "../../../auth/current-user.decorator.js";
import { RequirePermissions } from "../../../auth/require-permissions.decorator.js";
import type { SessionUser } from "../../../auth/session-user.js";
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserListQueryDto,
  UserPageDto,
} from "./dto/user.dto.js";
import { AssignRoleDto, UserRoleDto, UserRoleListDto } from "./dto/user-role.dto.js";
import { UserRolesService } from "./user-roles.service.js";
import { UsersService } from "./users.service.js";

@ApiTags("IAM")
@Controller("users")
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly userRoles: UserRolesService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ZodSerializerDto(UserPageDto)
  list(@Query() query: UserListQueryDto): Promise<Paginated<User>> {
    return this.service.list(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ZodSerializerDto(UserDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ZodSerializerDto(UserDto)
  create(@Body() body: CreateUserDto, @CurrentUser() user: SessionUser): Promise<User> {
    return this.service.create(body, user.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ZodSerializerDto(UserDto)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: SessionUser,
  ): Promise<User> {
    return this.service.update(id, body, user.id);
  }

  @Post(":id/deactivate")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ZodSerializerDto(UserDto)
  deactivate(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: SessionUser,
  ): Promise<User> {
    return this.service.deactivate(id, user.id);
  }

  @Get(":id/roles")
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ZodSerializerDto(UserRoleListDto)
  listRoles(@Param("id", ParseUUIDPipe) id: string): Promise<UserRole[]> {
    return this.userRoles.listForUser(id);
  }

  @Post(":id/roles")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ZodSerializerDto(UserRoleDto)
  assignRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: AssignRoleDto,
    @Authz() authz: AuthzContext,
  ): Promise<UserRole> {
    return this.userRoles.assign(id, body, authz);
  }
}
