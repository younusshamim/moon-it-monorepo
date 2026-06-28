import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "./errors.js";
import { err, isErr, isOk, mapOk, ok, unwrap } from "./result.js";

describe("ok / err constructors", () => {
  it("ok() produces Ok shape", () => {
    const r = ok(42);
    expect(r).toEqual({ ok: true, value: 42 });
  });

  it("err() produces Err shape", () => {
    const e = new NotFoundError();
    const r = err(e);
    expect(r).toEqual({ ok: false, error: e });
  });
});

describe("isOk / isErr", () => {
  it("isOk returns true for Ok", () => {
    expect(isOk(ok("x"))).toBe(true);
  });

  it("isOk returns false for Err", () => {
    expect(isOk(err(new NotFoundError()))).toBe(false);
  });

  it("isErr returns true for Err", () => {
    expect(isErr(err(new NotFoundError()))).toBe(true);
  });

  it("isErr returns false for Ok", () => {
    expect(isErr(ok("x"))).toBe(false);
  });
});

describe("unwrap", () => {
  it("returns the value for Ok", () => {
    expect(unwrap(ok("hello"))).toBe("hello");
  });

  it("throws the error for Err", () => {
    const e = new NotFoundError("missing");
    expect(() => unwrap(err(e))).toThrow(e);
  });
});

describe("mapOk", () => {
  it("applies fn to Ok value", () => {
    const fn = vi.fn((n: number) => n * 2);
    const result = mapOk(ok(3), fn);
    expect(result).toEqual(ok(6));
    expect(fn).toHaveBeenCalledWith(3);
  });

  it("passes Err through unchanged without calling fn", () => {
    const e = new NotFoundError();
    const fn = vi.fn((n: number) => n * 2);
    const result = mapOk(err(e), fn);
    expect(result).toEqual(err(e));
    expect(fn).not.toHaveBeenCalled();
  });
});
