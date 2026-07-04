// HTTP edge for branches. Routes sit under the global `/v1` prefix (→ `/v1/branches`). Bodies/queries
// are validated by the global ZodValidationPipe; responses are validated against the entity schema by
// the ZodSerializerInterceptor. The global AuthGuard requires a session (Phase 5); the authenticated
// user stamps the `createdBy`/`updatedBy` audit columns. Permission checks arrive in Phase 6.
import { type Branch, type Paginated, PERMISSIONS } from "@moonit/schema";
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
import { CurrentUser } from "../../../auth/current-user.decorator.js";
import { RequirePermissions } from "../../../auth/require-permissions.decorator.js";
import type { SessionUser } from "../../../auth/session-user.js";
import { PaginationQueryDto } from "../../../common/dto/pagination.dto.js";
import { BranchesService } from "./branches.service.js";
import { BranchDto, BranchPageDto, CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto.js";

@ApiTags("Organization")
@Controller("branches")
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.BRANCH_READ)
  @ZodSerializerDto(BranchPageDto)
  list(@Query() query: PaginationQueryDto): Promise<Paginated<Branch>> {
    return this.service.list(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.BRANCH_READ)
  @ZodSerializerDto(BranchDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Branch> {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.BRANCH_MANAGE)
  @ZodSerializerDto(BranchDto)
  create(@Body() body: CreateBranchDto, @CurrentUser() user: SessionUser): Promise<Branch> {
    return this.service.create(body, user.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.BRANCH_MANAGE)
  @ZodSerializerDto(BranchDto)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateBranchDto,
    @CurrentUser() user: SessionUser,
  ): Promise<Branch> {
    return this.service.update(id, body, user.id);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.BRANCH_MANAGE)
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: SessionUser): Promise<void> {
    return this.service.remove(id, user.id);
  }
}
