// HTTP edge for rooms (`/v1/rooms`). List is filterable by `branchId`. Unprotected — guards in Phase 6.
import type { Paginated, Room } from "@moonit/schema";
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
import {
  CreateRoomDto,
  RoomDto,
  RoomListQueryDto,
  RoomPageDto,
  UpdateRoomDto,
} from "./dto/room.dto.js";
import { RoomsService } from "./rooms.service.js";

@ApiTags("Organization")
@Controller("rooms")
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  @ZodSerializerDto(RoomPageDto)
  list(@Query() query: RoomListQueryDto): Promise<Paginated<Room>> {
    return this.service.list(query);
  }

  @Get(":id")
  @ZodSerializerDto(RoomDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Room> {
    return this.service.getById(id);
  }

  @Post()
  @ZodSerializerDto(RoomDto)
  create(@Body() body: CreateRoomDto): Promise<Room> {
    return this.service.create(body);
  }

  @Patch(":id")
  @ZodSerializerDto(RoomDto)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateRoomDto): Promise<Room> {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
