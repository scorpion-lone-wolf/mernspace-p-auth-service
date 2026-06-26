import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/User";
import { truncetTables } from "../utils";

describe("POST /auth/resgister", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });
  beforeEach(async () => {
    // Database truncation
    await truncetTables(dataSource);
  });
  afterAll(async () => {
    // after running all the test inisde this block we are destroying the datasource
    await dataSource.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // AAA :
      // Arrange (preparing all the things that are needed to run the test),
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act  (call the function that we want to test)
      const response = await request(app).post("/auth/register").send(userData);
      // Assert (validating the expected value and the actual value that we got)
      expect(response.statusCode).toBe(201);
    });
    it("should return valid json response", async () => {
      // Arrange (preparing all the things that are needed to run the test),
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act  (call the function that we want to test)
      const response = await request(app).post("/auth/register").send(userData);
      // Assert (validating the expected value and the actual value that we got)
      expect(response.headers["content-type"]).toContain("application/json");
    });
    it("should save the user into the databse", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();

      expect(users.length).toBe(1);
      // partial match
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
    it("should return the id of the created user", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.body).toHaveProperty("id");
    });
  });
  //   describe("Fields are missing", () => {});
});
