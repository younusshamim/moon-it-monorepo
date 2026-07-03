// HTTP edge for unassigning a branch-scoped role (`DELETE /v1/user-roles/:id`). Kept on its own route
// base because it targets an assignment by id, independent of the user path. Unprotected — Phase 6.
import { Controller, Delete, HttpCode, Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRolesService } from "./user-roles.service.js";

@ApiTags("IAM")
@Controller("user-roles")
export class UserRolesController {
  constructor(private readonly service: UserRolesService) {}

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
