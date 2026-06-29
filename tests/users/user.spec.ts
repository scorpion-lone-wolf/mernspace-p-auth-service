import { createJWKSMock } from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { User } from "../../src/entities/user";

describe("GET /auth/me", () => {
  let dataSource: DataSource;
  let jwksMockServer: ReturnType<typeof createJWKSMock>;
  let jwksCleanup: () => void;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    // creating the jwks server
    // Here this will run a mock server and we can simulate of getting pubic key from this server
    // We did this beacuse we don't want to run actual express server
    // now when in middleware where we validate the token , we will use jwtsClient to get the kid that was set in header of the token.
    // we will mention the URI where to get is from. This mock server is running on same address
    //  by default it exposes "/.well-known.jwks.json"
    jwksMockServer = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    jwksCleanup = jwksMockServer.start();
    // drop the database (this will not remove the database , instead it will remove all the tables in the database)
    await dataSource.dropDatabase();
    // synchronize all the tables in the database
    await dataSource.synchronize();
  });
  afterEach(async () => {
    jwksCleanup();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("Given user provides token in cookie", () => {
    it("should return user data", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Register a user (create a user in the database)
      const userRepository = dataSource.getRepository(User);
      const createdUser = await userRepository.save(userData);
      // Generate a token
      const tokenFromJwksServer = jwksMockServer.token({
        sub: createdUser.id,
        role: createdUser.role
      });
      // Add token to cookie
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`access_token=${tokenFromJwksServer}`]);
      // Assert
      // check user id from response matehes the regiseter user id
      expect(response.body.data.at(0).id).toBe(createdUser.id);
      expect(response.statusCode).toBe(200);
    });
    it("should not return user password", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Register a user (create a user in the database)
      const userRepository = dataSource.getRepository(User);
      const createdUser = await userRepository.save(userData);
      // Generate a token
      const tokenFromJwksServer = jwksMockServer.token({
        sub: createdUser.id,
        role: createdUser.role
      });
      // Add token to cookie
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`access_token=${tokenFromJwksServer}`]);
      // Assert
      // check user password should not be returned
      expect(response.body.data.at(0)).not.toHaveProperty("password");
    });
    it("should return 401 status code if we dont send any token", async () => {
      const response = await request(app).get("/auth/me");
      // Assert
      // check user password should not be returned
      expect(response.statusCode).toBe(401);
    });
  });
});
