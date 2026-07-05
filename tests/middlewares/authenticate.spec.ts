import { NextFunction, Request, Response } from "express";
import { createJWKSMock } from "mock-jwks";
import { describe, expect, it, vi } from "vitest";
import { authenticate } from "../../src/middlewares/authenticate";

describe("authenticate", () => {
  it("should throw 401 unauthorized if access token cannot be decoded", async () => {
    // Prepare
    const req = {
      cookies: {
        access_token: "invalid access token"
      },
      headers: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    // Act
    await expect(() => authenticate(req, res, next)).rejects.toMatchObject({
      status: 401
    });
  });

  it("should throw 401 unauthorized if access token is not valid", async () => {
    // Prepare
    const jwksMockServer = createJWKSMock("http://localhost:5501");
    const jwksCleanup = jwksMockServer.start();
    const validToken = jwksMockServer.token({
      sub: "user-id",
      role: "CUSTOMER"
    });
    const [header, payload] = validToken.split(".");
    const invalidToken = `${header}.${payload}.invalid-signature`;
    const req = {
      cookies: {
        access_token: invalidToken
      },
      headers: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    // Act
    await expect(() => authenticate(req, res, next)).rejects.toMatchObject({
      status: 401
    });

    jwksCleanup();
  });
});
