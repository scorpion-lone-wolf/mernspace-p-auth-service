import bcrypt from "bcrypt";
import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/enums";

describe("POST /auth/resgister", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });
  beforeEach(async () => {
    // delete all tables of the database(but the database will be present)
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });
  afterAll(async () => {
    // after running all the test inisde this block we are destroying the datasource
    await dataSource.dropDatabase();
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
    it("should only assign customer as a role during registration", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act
      await request(app).post("/auth/register").send(userData);
      // Assert (validate the role from the database for this user)
      const userRepository = dataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email }
      });
      expect(user?.role).toBe(UserRole.CUSTOMER);
    });
    it("should store the password as a hash in the database", async () => {
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
      // get the user from the database using email filter and select (id,email,password) filed explicitly
      const userRepository = dataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email },
        select: { id: true, email: true, password: true }
      });
      expect(user).not.toBeUndefined();
      if (user) {
        // validate that password is hashed of the user given password using bcrypt
        expect(await bcrypt.compare(userData.password, user?.password)).toBe(
          true
        );
      }
    });
    it("show throw an error if email already exists", async () => {
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
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(409);
      // also validate that count of user should be 1 only
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(1);
    });
  });
  describe("Fields are missing", () => {
    it("should return 400 status code if email filed is missing", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "secret"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
    it("should return 400 status code if email filed is invalid", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "test@email",
        password: "secret"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
    it("should return 400 status code if password filed is missing", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@eamil.com"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
    it("should return 400 status code if password length is less then 6", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@eamil.com",
        password: "12345"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
    it("should return 400 status code if firstName is missing", async () => {
      // Arrange
      const userData = {
        lastName: "Doe",
        email: "johndoe@eamil.com",
        password: "12345678"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
    it("should return 400 status code if lastName length is missing", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        email: "johndoe@eamil.com",
        password: "12345678"
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(400);
      // also no record should be created
      const userRepository = dataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(0);
    });
  });
  describe("Fields are not given correctly", () => {
    it("should sanitize the output if firstName has any html tag", async () => {
      // Arrange
      const userData = {
        firstName: "<h1>John</h1> ",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret"
      };
      // Act
      const respose = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(respose.body.firstName).toBe("John");
    });
    it("should trim the email address and make lowercase", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "   Johndoe@Email.com ",
        password: "secret"
      };
      // Act
      const respose = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(respose.body.email).toBe("johndoe@email.com");
    });
  });
});
