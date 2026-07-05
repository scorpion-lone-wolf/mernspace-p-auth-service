import { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateRefreshToken } from "../../src/middlewares/validateRefreshToken";

describe("validateRefreshToken", () => {
  it("should throw 401 unauthorized if refresh token is not present in cookies", async () => {
    //    Prepare
    const req = {
      cookies: {},
      headers: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    // Act
    await expect(() =>
      validateRefreshToken(req, res, next)
    ).rejects.toMatchObject({
      status: 401
    });
  });
  it("should throw 401 unauthorized if refresh token is not valid", async () => {
    //    Prepare
    const req = {
      cookies: {
        refresh_token: "invalid refresh token"
      },
      headers: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    // Act
    await expect(() =>
      validateRefreshToken(req, res, next)
    ).rejects.toMatchObject({
      status: 401
    });
  });
});
