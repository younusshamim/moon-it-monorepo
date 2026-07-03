// HTTP edge for users (`/v1/users`). CRUD plus deactivate, and branch-scoped role assignment nested
// under the user. No DELETE — users are deactivated, not removed. Unprotected — Phase 6.
import type { Paginated, User, UserRole } from "@moonit/schema";
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
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
  @ZodSerializerDto(UserPageDto)
  list(@Query() query: UserListQueryDto): Promise<Paginated<User>> {
    return this.service.list(query);
  }

  @Get(":id")
  @ZodSerializerDto(UserDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.service.getById(id);
  }

  @Post()
  @ZodSerializerDto(UserDto)
  create(@Body() body: CreateUserDto): Promise<User> {
    return this.service.create(body);
  }

  @Patch(":id")
  @ZodSerializerDto(UserDto)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.service.update(id, body);
  }

  @Post(":id/deactivate")
  @ZodSerializerDto(UserDto)
  deactivate(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.service.deactivate(id);
  }

  @Get(":id/roles")
  @ZodSerializerDto(UserRoleListDto)
  listRoles(@Param("id", ParseUUIDPipe) id: string): Promise<UserRole[]> {
    return this.userRoles.listForUser(id);
  }

  @Post(":id/roles")
  @ZodSerializerDto(UserRoleDto)
  assignRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: AssignRoleDto,
  ): Promise<UserRole> {
    return this.userRoles.assign(id, body);
  }
}
