// HTTP edge for branches. Routes sit under the global `/v1` prefix (→ `/v1/branches`). Bodies/queries
// are validated by the global ZodValidationPipe; responses are validated against the entity schema by
// the ZodSerializerInterceptor. Unprotected for now — permission guards arrive in Phase 6.
import type { Branch, Paginated } from "@moonit/schema";
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
import { PaginationQueryDto } from "../../../common/dto/pagination.dto.js";
import { BranchesService } from "./branches.service.js";
import { BranchDto, BranchPageDto, CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto.js";

@ApiTags("Organization")
@Controller("branches")
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Get()
  @ZodSerializerDto(BranchPageDto)
  list(@Query() query: PaginationQueryDto): Promise<Paginated<Branch>> {
    return this.service.list(query);
  }

  @Get(":id")
  @ZodSerializerDto(BranchDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Branch> {
    return this.service.getById(id);
  }

  @Post()
  @ZodSerializerDto(BranchDto)
  create(@Body() body: CreateBranchDto): Promise<Branch> {
    return this.service.create(body);
  }

  @Patch(":id")
  @ZodSerializerDto(BranchDto)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateBranchDto): Promise<Branch> {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
