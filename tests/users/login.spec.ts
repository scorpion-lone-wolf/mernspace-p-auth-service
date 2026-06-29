import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { User } from "../../src/entities/user";
import { UserService } from "../../src/services/userService";

describe("POST /auth/login", () => {
  let dataSource: DataSource;
  let userService: UserService;
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userService = new UserService(dataSource.getRepository(User));
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

  describe("Given all fields", () => {
    it("should return 200 status code if cred are correct", async () => {
      // Prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act (call to the endpoint)
      // first add the user into the databse
      await userService.create(userData);
      const response = await request(app)
        .post("/auth/login")
        .send({ email: userData.email, password: userData.password });
      //   Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return user id after successful login", async () => {
      // Prepare
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act (call to the endpoint)
      // first add the user into the databse
      await userService.create(userData);
      const response = await request(app)
        .post("/auth/login")
        .send({ email: userData.email, password: userData.password });
      //   Assert
      expect(response.body.id).toBeTruthy();
    });
    it("should add access_token and refresh_token inside a cookie", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act (call to the endpoint)
      // first add the user into the databse
      await userService.create(userData);
      const response = await request(app)
        .post("/auth/login")
        .send({ email: userData.email, password: userData.password });
      // Assert
      const cookies = response.headers["set-cookie"];

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
    it("should return 401 status code if cred are incorrect", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act (call to the endpoint)
      // first add the user into the databse
      await userService.create(userData);
      const response = await request(app)
        .post("/auth/login")
        .send({ email: userData.email, password: "incorrectpassword" });
      // Assert
      expect(response.statusCode).toBe(401);
      expect(response.body.errors[0].message).toBe("Password is incorrect");
    });
    it("should return 404 status code if user does not exist", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      //   Act (call to the endpoint)
      // first add the user into the databse
      await userService.create(userData);
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@email.com", password: userData.password });
      //   Assert
      expect(response.statusCode).toBe(404);
      expect(response.body.errors[0].message).toBe("User not found");
    });
  });
  describe("Given Some fields are missing", () => {
    it.todo(
      "should return 400 status code if email field is missing",
      () => {}
    );
    it.todo(
      "should return 400 status code if password field is missing",
      () => {}
    );
  });
});
