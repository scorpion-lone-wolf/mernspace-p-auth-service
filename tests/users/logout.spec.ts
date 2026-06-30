import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { RefreshToken } from "../../src/entities/refreshToken";
import { User } from "../../src/entities/user";
import { TokenService } from "../../src/services/tokenService";
import { UserService } from "../../src/services/userService";

describe("POST /auth/logout", () => {
  let dataSource: DataSource;
  let userService: UserService;
  let tokenService: TokenService;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userService = new UserService(dataSource.getRepository(User));
    tokenService = new TokenService(dataSource.getRepository(RefreshToken));
  });
  beforeEach(async () => {
    // delete all tables of the database(but the database will be present)
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });
  afterAll(async () => {
    // after running all the test inisde this block we are destroying the datasource
    await dataSource.destroy();
  });

  describe("Given user is logged in", () => {
    it("it should return 200 status code", async () => {
      // Prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act
      // create a user in the databse
      const user = await userService.create(userData);
      //    add and entry for refresh token in the database
      const refreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      //    create a refresh token for that user and add the RefreshTokenEntry id in the token as header
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        refreshTokenEntry
      );

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", `refresh_token=${refreshToken}`);
      //    Assert
      expect(response.statusCode).toBe(200);
    });
    it("it should successfully remove the refresh token entry from the RefreshToken table", async () => {
      // Prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act
      // create a user in the databse
      const user = await userService.create(userData);
      //    add and entry for refresh token in the database
      const refreshTokenEntry = await tokenService.persistRefreshToken(
        user,
        1000 * 60 * 60
      );
      //    create a refresh token for that user and add the RefreshTokenEntry id in the token as header
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        refreshTokenEntry
      );

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", `refresh_token=${refreshToken}`);
      const refreshTokenRepository = dataSource.getRepository(RefreshToken);
      const refreshTokenEntries = await refreshTokenRepository.find({
        where: {
          id: refreshTokenEntry.id
        }
      });
      //    Assert
      console.log(refreshTokenEntries);
      expect(refreshTokenEntries.length).toBe(0);
    });
  });
  //   describe("Given user is not logged in", () => {});
});
