// Reference test for the IAM roles guard: system roles (`isSystem`) are read-only — update and delete
// must throw ForbiddenError and never reach the repository. Also covers the missing-role 404 path.
// Fake-repository style, mirroring branches.service.spec.ts / health.controller.spec.ts.
import { ConflictError, ForbiddenError, NotFoundError } from "@moonit/core";
import type { Role } from "@moonit/schema";
import { describe, expect, it, vi } from "vitest";
import { RolesRepository } from "./roles.repository.js";
import { RolesService } from "./roles.service.js";

function fakeRepository(overrides: Partial<RolesRepository> = {}): RolesRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    listPermissions: vi.fn(),
    replacePermissions: vi.fn(),
    ...overrides,
  } as unknown as RolesRepository;
}

const systemRole = { id: "r1", key: "super_admin", name: "Super Admin", isSystem: true } as Role;
const customRole = { id: "r2", key: "front_desk", name: "Front Desk", isSystem: false } as Role;

describe("RolesService", () => {
  describe("update", () => {
    it("refuses to modify a system role (403) without touching the repository", async () => {
      const update = vi.fn();
      const service = new RolesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(systemRole), update }),
      );
      await expect(service.update("r1", { name: "x" })).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it("updates a non-system role", async () => {
      const updated = { ...customRole, name: "Reception" };
      const service = new RolesService(
        fakeRepository({
          findById: vi.fn().mockResolvedValue(customRole),
          update: vi.fn().mockResolvedValue(updated),
        }),
      );
      await expect(service.update("r2", { name: "Reception" })).resolves.toBe(updated);
    });

    it("throws NotFoundError for an unknown role", async () => {
      const service = new RolesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(undefined) }),
      );
      await expect(service.update("nope", { name: "x" })).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("remove", () => {
    it("refuses to delete a system role (403)", async () => {
      const del = vi.fn();
      const service = new RolesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(systemRole), delete: del }),
      );
      await expect(service.remove("r1")).rejects.toBeInstanceOf(ForbiddenError);
      expect(del).not.toHaveBeenCalled();
    });

    it("hard-deletes a non-system role", async () => {
      const del = vi.fn().mockResolvedValue("r2");
      const service = new RolesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(customRole), delete: del }),
      );
      await expect(service.remove("r2")).resolves.toBeUndefined();
      expect(del).toHaveBeenCalledWith("r2");
    });
  });

  describe("create", () => {
    it("maps a duplicate key to ConflictError", async () => {
      const service = new RolesService(
        fakeRepository({ create: vi.fn().mockRejectedValue({ code: "23505" }) }),
      );
      await expect(service.create({ key: "super_admin", name: "x" })).rejects.toBeInstanceOf(
        ConflictError,
      );
    });
  });
});
