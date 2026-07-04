// Room domain logic. Throws @moonit/core domain errors; the DomainExceptionFilter maps them to HTTP.
// A duplicate/constraint violation surfaces as ConflictError via mapPgError. Writes are branch-scoped:
// the caller's AuthzContext must allow `room.manage` on the room's branch (Phase 6). See Phase 1.
import { NotFoundError } from "@moonit/core";
import {
  type NewRoom,
  type Paginated,
  PERMISSIONS,
  type Room,
  type UpdateRoom,
} from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import type { AuthzContext } from "../../../auth/authz-context.js";
import { mapPgError } from "../../../common/db/pg-error.js";
import type { RoomListQuery } from "./dto/room.dto.js";
import { RoomsRepository } from "./rooms.repository.js";

@Injectable()
export class RoomsService {
  constructor(private readonly repository: RoomsRepository) {}

  list(query: RoomListQuery): Promise<Paginated<Room>> {
    return this.repository.list(query);
  }

  async getById(id: string): Promise<Room> {
    const room = await this.repository.findById(id);
    if (!room) throw new NotFoundError(`Room ${id} not found`);
    return room;
  }

  async create(input: NewRoom, authz: AuthzContext): Promise<Room> {
    authz.assertBranch(PERMISSIONS.ROOM_MANAGE, input.branchId);
    try {
      return await this.repository.create(input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Room already exists" });
    }
  }

  async update(id: string, input: UpdateRoom, authz: AuthzContext): Promise<Room> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError(`Room ${id} not found`);
    authz.assertBranch(PERMISSIONS.ROOM_MANAGE, existing.branchId);
    // Moving a room to a different branch requires access to the target branch too.
    if (input.branchId && input.branchId !== existing.branchId) {
      authz.assertBranch(PERMISSIONS.ROOM_MANAGE, input.branchId);
    }

    let room: Room | undefined;
    try {
      room = await this.repository.update(id, input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Room already exists" });
    }
    if (!room) throw new NotFoundError(`Room ${id} not found`);
    return room;
  }

  async remove(id: string, authz: AuthzContext): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError(`Room ${id} not found`);
    authz.assertBranch(PERMISSIONS.ROOM_MANAGE, existing.branchId);

    const deletedId = await this.repository.softDelete(id);
    if (!deletedId) throw new NotFoundError(`Room ${id} not found`);
  }
}
