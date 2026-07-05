import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { RefreshToken } from "../../src/entities/refreshToken";
import { Tenant } from "../../src/entities/tenant";
import { User } from "../../src/entities/user";
import { TokenService } from "../../src/services/tokenService";
import { UserService } from "../../src/services/userService";

describe("POST /auth/refresh", () => {
  let dataSource: DataSource;
  let userService: UserService;
  let tokenService: TokenService;
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userService = new UserService(
      dataSource.getRepository(User),
      dataSource.getRepository(Tenant)
    );
    tokenService = new TokenService(dataSource.getRepository(RefreshToken));
  });

  beforeEach(async () => {
    // drop the database (this will not remove the database , instead it will remove all the tables in the database)
    await dataSource.dropDatabase();
    // synchronize all the tables in the database
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("Given user provides refresh token in cookie", () => {
    it("should return 200 status code", async () => {
      // prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };

      //   Act
      //   insert the user into the database
      const user = await userService.create(userData);
      // generate a refresh token

      const newRefreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        newRefreshTokenEntry
      );
      // Use that refresh token to call to refresh endpoint
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`);
      // Assert
      expect(refreshResponse.statusCode).toBe(200);
    });
    it("should return access_token and refresh_token inside a cookie", async () => {
      // prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };

      //   Act
      //   insert the user into the database
      const user = await userService.create(userData);
      // generate a refresh token

      const newRefreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        newRefreshTokenEntry
      );
      // Use that refresh token to call to refresh endpoint
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`);
      // this refresh response should contain access_token and refresh_token
      const cookies = refreshResponse.headers["set-cookie"];
      expect(Array.isArray(cookies)).toBe(true);
      if (Array.isArray(cookies)) {
        // it should contain accessa token and refresh token
        cookies.forEach((cookie: string) => {
          if (cookie.startsWith("access_token=")) {
            expect(cookie.split("=")[1]).toBeTruthy();
          }
          if (cookie.startsWith("refresh_token=")) {
            expect(cookie.split("=")[1]).toBeTruthy();
          }
        });
      }
    });
    it("should return 401 status code for invalid refresh token", async () => {
      // prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };

      //   Act
      //   insert the user into the database
      const user = await userService.create(userData);
      // entry the refresh token into the database
      const newRefreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      // generate a refresh token
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        newRefreshTokenEntry
      );
      // Use that refresh token to call to refresh endpoint
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken + "invalid"}`);
      // Assert
      expect(refreshResponse.statusCode).toBe(401);
    });
    it("should return 401 status code for valid refresh token but not present in RefreshToken table", async () => {
      // prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };

      //   Act
      //   insert the user into the database
      const user = await userService.create(userData);
      // entry the refresh token into the database
      const newRefreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      // generate a refresh token
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        newRefreshTokenEntry
      );
      // delete the refresh token entry (its like revoking the refresh token)
      await dataSource.getRepository(RefreshToken).delete({
        id: newRefreshTokenEntry.id
      });
      // Use that refresh token to call to refresh endpoint
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`);
      // Assert
      expect(refreshResponse.statusCode).toBe(401);
      expect(refreshResponse.body.errors[0].message).toBe("Unauthorized");
    });
  });
  describe("Given user don't provides refresh token in cookie", () => {
    it.todo("should return 401 status code", () => {});
  });
});
