// Room domain logic. Throws @moonit/core domain errors; the DomainExceptionFilter maps them to HTTP.
// A duplicate/constraint violation surfaces as ConflictError via mapPgError. See Phase 1.
import { NotFoundError } from "@moonit/core";
import type { NewRoom, Paginated, Room, UpdateRoom } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
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

  async create(input: NewRoom): Promise<Room> {
    try {
      return await this.repository.create(input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Room already exists" });
    }
  }

  async update(id: string, input: UpdateRoom): Promise<Room> {
    let room: Room | undefined;
    try {
      room = await this.repository.update(id, input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Room already exists" });
    }
    if (!room) throw new NotFoundError(`Room ${id} not found`);
    return room;
  }

  async remove(id: string): Promise<void> {
    const deletedId = await this.repository.softDelete(id);
    if (!deletedId) throw new NotFoundError(`Room ${id} not found`);
  }
}
