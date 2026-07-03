// nestjs-zod DTOs for the rooms endpoints. Bodies/responses wrap @moonit/schema; the list query
// extends the shared PaginationQuery with an optional `branchId` filter (rooms are scoped to a branch).
import {
  NewRoomSchema,
  PaginationQuerySchema,
  paginated,
  RoomSchema,
  UpdateRoomSchema,
} from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateRoomDto extends createZodDto(NewRoomSchema) {}
export class UpdateRoomDto extends createZodDto(UpdateRoomSchema) {}

/** Single-room response. */
export class RoomDto extends createZodDto(RoomSchema) {}
/** Paginated list response. */
export class RoomPageDto extends createZodDto(paginated(RoomSchema)) {}

/** List query schema: pagination plus an optional `branchId` filter. */
const RoomListQuerySchema = PaginationQuerySchema.extend({ branchId: z.uuid().optional() });
export class RoomListQueryDto extends createZodDto(RoomListQuerySchema) {}
export type RoomListQuery = z.infer<typeof RoomListQuerySchema>;
