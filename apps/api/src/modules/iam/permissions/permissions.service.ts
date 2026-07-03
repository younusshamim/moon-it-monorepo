// Permission domain logic. The catalog is read-only in this phase (seeded in Phase 3).
import type { Permission } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import { PermissionsRepository } from "./permissions.repository.js";

@Injectable()
export class PermissionsService {
  constructor(private readonly repository: PermissionsRepository) {}

  list(): Promise<Permission[]> {
    return this.repository.list();
  }
}
