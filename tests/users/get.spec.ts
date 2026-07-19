import createJWKSMock from "mock-jwks";
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
import { UserRole } from "../../src/enums";

describe("GET /users", () => {
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
  describe("Given user is logged", () => {
    it("should return 200 status code", async () => {
      // Prepare
      const adminUserData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return users from the database", async () => {
      // Prepare
      const adminUserData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      const createManagerUser = await userRepository.save(managerUserData);
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.body.data.length).toBe(2);
    });
    it("should filter users by search query and role", async () => {
      // Prepare
      const adminUserData = {
        firstName: "John",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const customerUserData = {
        firstName: "John",
        lastName: "customer",
        email: "customer@example.com",
        password: "customer123",
        role: UserRole.CUSTOMER
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "john.manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      await userRepository.save([customerUserData, managerUserData]);
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get("/users")
        .query({ search: "John", role: UserRole.ADMIN })
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(createdAdminUser.id);
      expect(response.body.data[0].role).toBe(UserRole.ADMIN);
      expect(response.body.total).toBe(1);
    });
    it("should return 400 status code for invalid role query", async () => {
      // Prepare
      const adminUserData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get("/users")
        .query({ role: "OWNER" })
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(400);
    });
    it("should return 403 if huser is not authorized", async () => {
      // Prepare
      const userData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.CUSTOMER
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdUser = await userRepository.save(userData);
      const createManagerUser = await userRepository.save(managerUserData);
      const adminToken = jwksMockServer.token({
        sub: createdUser.id,
        role: createdUser.role
      });
      //   Act
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(403);
    });
  });
});
describe("GET /users/id", () => {
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
  describe("Given user is logged", () => {
    it("should return 200 status code", async () => {
      // Prepare
      const adminUserData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      const createManagerUser = await userRepository.save(managerUserData);
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get(`/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return particular user from the database", async () => {
      // Prepare
      const adminUserData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      const createManagerUser = await userRepository.save(managerUserData);
      const user = await userRepository.findOne({
        where: { id: createManagerUser.id }
      });
      const adminToken = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      //   Act
      const response = await request(app)
        .get(`/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.body.data.id).toBe(user?.id);
    });
    it("should return 403 if huser is not authorized", async () => {
      // Prepare
      const userData = {
        firstName: "Admin",
        lastName: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.MANAGER
      };
      const managerUserData = {
        firstName: "Manager",
        lastName: "manager",
        email: "manager@example.com",
        password: "manager123",
        role: UserRole.MANAGER
      };
      const userRepository = dataSource.getRepository(User);
      const createdUser = await userRepository.save(userData);
      const createManagerUser = await userRepository.save(managerUserData);
      const user = await userRepository.findOne({
        where: { id: createManagerUser.id }
      });
      const adminToken = jwksMockServer.token({
        sub: createdUser.id,
        role: createdUser.role
      });
      //   Act
      const response = await request(app)
        .get(`/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(403);
    });
  });
});
