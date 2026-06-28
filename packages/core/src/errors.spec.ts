import { describe, expect, it } from "vitest";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./errors.js";

describe("DomainError", () => {
  it("carries the given code and message", () => {
    const e = new NotFoundError("Student not found");
    expect(e.code).toBe("NOT_FOUND");
    expect(e.message).toBe("Student not found");
  });

  it("all subclasses are instanceof DomainError", () => {
    expect(new NotFoundError()).toBeInstanceOf(DomainError);
    expect(new ForbiddenError()).toBeInstanceOf(DomainError);
    expect(new ConflictError()).toBeInstanceOf(DomainError);
    expect(new ValidationError("bad")).toBeInstanceOf(DomainError);
  });
});

describe("NotFoundError", () => {
  it("uses default message", () => {
    expect(new NotFoundError().message).toBe("Not found");
  });

  it("has correct name and code", () => {
    const e = new NotFoundError();
    expect(e.name).toBe("NotFoundError");
    expect(e.code).toBe("NOT_FOUND");
  });
});

describe("ForbiddenError", () => {
  it("uses default message", () => {
    expect(new ForbiddenError().message).toBe("Forbidden");
  });

  it("has correct name and code", () => {
    const e = new ForbiddenError();
    expect(e.name).toBe("ForbiddenError");
    expect(e.code).toBe("FORBIDDEN");
  });
});

describe("ConflictError", () => {
  it("uses default message", () => {
    expect(new ConflictError().message).toBe("Conflict");
  });

  it("has correct name and code", () => {
    const e = new ConflictError();
    expect(e.name).toBe("ConflictError");
    expect(e.code).toBe("CONFLICT");
  });
});

describe("ValidationError", () => {
  it("has correct name and code", () => {
    const e = new ValidationError("Invalid input");
    expect(e.name).toBe("ValidationError");
    expect(e.code).toBe("VALIDATION_ERROR");
  });

  it("defaults to empty issues array", () => {
    expect(new ValidationError("bad").issues).toEqual([]);
  });

  it("stores field-level issues", () => {
    const issues = [
      { path: ["email"], message: "Invalid email" },
      { path: ["name", "first"], message: "Required" },
    ];
    const e = new ValidationError("Validation failed", issues);
    expect(e.issues).toEqual(issues);
  });

  it("forwards cause via ErrorOptions", () => {
    const cause = new Error("original");
    const e = new NotFoundError("wrap", { cause });
    expect(e.cause).toBe(cause);
  });
});
