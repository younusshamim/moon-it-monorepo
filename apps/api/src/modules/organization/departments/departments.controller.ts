// HTTP edge for departments (`/v1/departments`). List is filterable by `branchId`. Unprotected — Phase 6.
import type { Department, Paginated } from "@moonit/schema";
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
  @ZodSerializerDto(DepartmentPageDto)
  list(@Query() query: DepartmentListQueryDto): Promise<Paginated<Department>> {
    return this.service.list(query);
  }

  @Get(":id")
  @ZodSerializerDto(DepartmentDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Department> {
    return this.service.getById(id);
  }

  @Post()
  @ZodSerializerDto(DepartmentDto)
  create(@Body() body: CreateDepartmentDto): Promise<Department> {
    return this.service.create(body);
  }

  @Patch(":id")
  @ZodSerializerDto(DepartmentDto)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
