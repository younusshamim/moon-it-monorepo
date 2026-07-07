// HTTP edge for rooms (`/v1/rooms`). List is filterable by `branchId`. `room.read`/`room.manage`
// gate the routes (PermissionsGuard); the AuthzContext threads into the service for branch scoping.
import { type Paginated, PERMISSIONS, type Room } from "@moonit/schema";
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
  @RequirePermissions(PERMISSIONS.ROOM_READ)
  @ZodSerializerDto(RoomPageDto)
  list(@Query() query: RoomListQueryDto): Promise<Paginated<Room>> {
    return this.service.list(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.ROOM_READ)
  @ZodSerializerDto(RoomDto)
  getById(@Param("id", ParseUUIDPipe) id: string): Promise<Room> {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ROOM_MANAGE)
  @ZodSerializerDto(RoomDto)
  create(
    @Body() body: CreateRoomDto,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<Room> {
    return this.service.create(body, authz, user.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.ROOM_MANAGE)
  @ZodSerializerDto(RoomDto)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateRoomDto,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<Room> {
    return this.service.update(id, body, authz, user.id);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.ROOM_MANAGE)
  @HttpCode(204)
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Authz() authz: AuthzContext,
    @CurrentUser() user: SessionUser,
  ): Promise<void> {
    return this.service.remove(id, authz, user.id);
  }
}
