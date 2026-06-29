import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Logger } from "winston";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { RefreshToken } from "../../src/entities/refreshToken";
import { User } from "../../src/entities/user";
import { TokenService } from "../../src/services/tokenService";
import { UserService } from "../../src/services/userService";

describe("GET /auth/me", () => {
  let dataSource: DataSource;
  let userService: UserService;
  let tokenService: TokenService;
  let logger: Logger;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userService = new UserService(dataSource.getRepository(User));
    tokenService = new TokenService(dataSource.getRepository(RefreshToken));
    logger = new Logger();
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

  describe("Given user provides token in cookie", () => {
    it.todo("should return 200 status code if token is valid", async () => {
      // Arrange (no need to arange anything for this test)
      //   Act
      const response = await request(app).get("/auth/me").send();
      //   Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return user data", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act
      //   save the user into the database and retuen the user
      const newUser = await userService.create(userData);
      //   create jwt token with that user(sub and role) which is returned from the database
      const accessToken = await tokenService.generateAccessToken(
        logger,
        newUser
      );
      //   save that token in cookie and send it to the endpoint "/auth/me"
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`access_token=${accessToken}`]);
      //   Assert
      //   expect that same user data is returned
      expect(response.statusCode).toBe(200);
      expect(response.body.data[0]).toEqual({
        id: newUser.id,
        firstName: "John",
        email: "johndoe@email.com"
      });
    });
  });
});
