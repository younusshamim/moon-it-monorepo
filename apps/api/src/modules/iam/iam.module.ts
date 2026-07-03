// IAM domain module: wires the users, roles, and permissions verticals plus branch-scoped role
// assignment. The DRIZZLE token comes from the @Global DatabaseModule. Unprotected in Phase 2 —
// permission guards are added module-wide in Phase 6. See docs/API_AND_AUTH_PLAN.md.
import { Module } from "@nestjs/common";
import { PermissionsController } from "./permissions/permissions.controller.js";
import { PermissionsRepository } from "./permissions/permissions.repository.js";
import { PermissionsService } from "./permissions/permissions.service.js";
import { RolesController } from "./roles/roles.controller.js";
import { RolesRepository } from "./roles/roles.repository.js";
import { RolesService } from "./roles/roles.service.js";
import { UserRolesController } from "./users/user-roles.controller.js";
import { UserRolesRepository } from "./users/user-roles.repository.js";
import { UserRolesService } from "./users/user-roles.service.js";
import { UsersController } from "./users/users.controller.js";
import { UsersRepository } from "./users/users.repository.js";
import { UsersService } from "./users/users.service.js";

@Module({
  controllers: [UsersController, UserRolesController, RolesController, PermissionsController],
  providers: [
    UsersService,
    UsersRepository,
    UserRolesService,
    UserRolesRepository,
    RolesService,
    RolesRepository,
    PermissionsService,
    PermissionsRepository,
  ],
})
export class IamModule {}
