// HTTP edge for unassigning a branch-scoped role (`DELETE /v1/user-roles/:id`). Kept on its own route
// base because it targets an assignment by id, independent of the user path. Gated by `user.manage`.
import { PERMISSIONS } from "@moonit/schema";
import { Controller, Delete, HttpCode, Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RequirePermissions } from "../../../auth/require-permissions.decorator.js";
import { UserRolesService } from "./user-roles.service.js";

@ApiTags("IAM")
@Controller("user-roles")
export class UserRolesController {
  constructor(private readonly service: UserRolesService) {}

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
