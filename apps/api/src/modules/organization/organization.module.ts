// Organization domain module: wires the branches, rooms, and departments verticals. The DRIZZLE token
// is provided by the @Global DatabaseModule, so no imports are needed here. Unprotected in Phase 1 —
// permission guards are added module-wide in Phase 6. See docs/API_AND_AUTH_PLAN.md.
import { Module } from "@nestjs/common";
import { BranchesController } from "./branches/branches.controller.js";
import { BranchesRepository } from "./branches/branches.repository.js";
import { BranchesService } from "./branches/branches.service.js";
import { DepartmentsController } from "./departments/departments.controller.js";
import { DepartmentsRepository } from "./departments/departments.repository.js";
import { DepartmentsService } from "./departments/departments.service.js";
import { RoomsController } from "./rooms/rooms.controller.js";
import { RoomsRepository } from "./rooms/rooms.repository.js";
import { RoomsService } from "./rooms/rooms.service.js";

@Module({
  controllers: [BranchesController, RoomsController, DepartmentsController],
  providers: [
    BranchesService,
    BranchesRepository,
    RoomsService,
    RoomsRepository,
    DepartmentsService,
    DepartmentsRepository,
  ],
})
export class OrganizationModule {}
