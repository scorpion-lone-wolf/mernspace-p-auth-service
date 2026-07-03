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

describe("DELETE /admin/users/id", () => {
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
        .delete(`/admin/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(200);
    });
    it("should delete particular user from the database", async () => {
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
        .delete(`/admin/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      const user = await userRepository.findOne({
        where: { id: createManagerUser.id }
      });
      expect(user).toBeNull();
      expect(response.body.message).toBe("User deleted");
    });
    it("should return 403 if user is not authorized", async () => {
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
        .delete(`/admin/users/${createManagerUser.id}`)
        .set("Cookie", [`access_token=${adminToken}`]);
      //  Assert
      expect(response.statusCode).toBe(403);
    });
  });
});
