// Reference unit test for the Phase 1 module pattern: the service is exercised with a fake repository
// (no Nest harness, no DB), mirroring health.controller.spec.ts. Proves the domain-error translation
// contract — NotFoundError on missing rows, ConflictError on a Postgres unique violation.
import { ConflictError, NotFoundError } from "@moonit/core";
import type { Branch, Paginated } from "@moonit/schema";
import { describe, expect, it, vi } from "vitest";
import { BranchesRepository } from "./branches.repository.js";
import { BranchesService } from "./branches.service.js";

function fakeRepository(overrides: Partial<BranchesRepository> = {}): BranchesRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    ...overrides,
  } as unknown as BranchesRepository;
}

const branch = { id: "b1", code: "DHK-01", name: "Head Office" } as unknown as Branch;
const ACTOR = "00000000-0000-0000-0000-000000000001";

describe("BranchesService", () => {
  describe("getById", () => {
    it("returns the row when found", async () => {
      const service = new BranchesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(branch) }),
      );
      await expect(service.getById("b1")).resolves.toBe(branch);
    });

    it("throws NotFoundError when the row is missing", async () => {
      const service = new BranchesService(
        fakeRepository({ findById: vi.fn().mockResolvedValue(undefined) }),
      );
      await expect(service.getById("nope")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("create", () => {
    it("passes the created row through", async () => {
      const service = new BranchesService(
        fakeRepository({ create: vi.fn().mockResolvedValue(branch) }),
      );
      await expect(service.create({ code: "DHK-01", name: "Head Office" }, ACTOR)).resolves.toBe(
        branch,
      );
    });

    it("maps a Postgres unique violation to ConflictError", async () => {
      const service = new BranchesService(
        fakeRepository({ create: vi.fn().mockRejectedValue({ code: "23505" }) }),
      );
      await expect(
        service.create({ code: "DHK-01", name: "Head Office" }, ACTOR),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe("remove", () => {
    it("throws NotFoundError when nothing was soft-deleted", async () => {
      const service = new BranchesService(
        fakeRepository({ softDelete: vi.fn().mockResolvedValue(undefined) }),
      );
      await expect(service.remove("nope", ACTOR)).rejects.toBeInstanceOf(NotFoundError);
    });

    it("resolves when a live row was soft-deleted", async () => {
      const service = new BranchesService(
        fakeRepository({ softDelete: vi.fn().mockResolvedValue("b1") }),
      );
      await expect(service.remove("b1", ACTOR)).resolves.toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns the repository's paginated envelope unchanged", async () => {
      const page: Paginated<Branch> = { data: [branch], page: 1, pageSize: 20, total: 1 };
      const service = new BranchesService(
        fakeRepository({ list: vi.fn().mockResolvedValue(page) }),
      );
      await expect(service.list({ page: 1, pageSize: 20, order: "desc" })).resolves.toBe(page);
    });
  });
});
