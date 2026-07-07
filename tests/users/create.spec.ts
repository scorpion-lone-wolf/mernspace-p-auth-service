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
import { Tenant } from "../../src/entities/tenant";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/enums";

describe("POST /users", () => {
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
    it.todo(
      "should return 201 status code for user with admin role",
      async () => {
        const adminUserData = {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@email.com",
          password: "secret",
          role: UserRole.ADMIN
        };
        const tenant = await dataSource.getRepository(Tenant).save({
          name: "Tenant-1",
          address: "Address-1"
        });
        const managerUserData = {
          firstName: "JohnManager",
          lastName: "Doe",
          email: "johndoemanager@email.com",
          password: "secret",
          role: UserRole.MANAGER,
          tenantId: tenant.id
        };
        // Register a user (create a user in the database)
        const userRepository = dataSource.getRepository(User);
        const createdUser = await userRepository.save(adminUserData);
        // Generate a token
        const tokenFromJwksServer = jwksMockServer.token({
          sub: createdUser.id,
          role: createdUser.role
        });
        // Add token to cookie
        const response = await request(app)
          .post("/users")
          .set("Cookie", [`access_token=${tokenFromJwksServer}`])
          .send(managerUserData);
        // Assert
        expect(response.statusCode).toBe(201);
      }
    );
    it.todo(
      "should return user data from the database with role that they set",
      async () => {
        const adminUserData = {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@email.com",
          password: "secret",
          role: UserRole.ADMIN
        };
        const tenant = await dataSource.getRepository(Tenant).save({
          name: "Tenant-1",
          address: "Address-1"
        });
        const managerUserData = {
          firstName: "JohnManager",
          lastName: "Doe",
          email: "johndoemanager@email.com",
          password: "secret",
          role: UserRole.MANAGER,
          tenantId: tenant.id
          // tenantId: "fec487ed-4c71-4533-8a14-3b20f7e36614"
        };

        // Register a user (create a user in the database)
        const userRepository = dataSource.getRepository(User);
        const createdAdminUser = await userRepository.save(adminUserData);
        // Generate a token
        const tokenFromJwksServer = jwksMockServer.token({
          sub: createdAdminUser.id,
          role: createdAdminUser.role
        });
        // Add token to cookie
        const response = await request(app)
          .post("/users")
          .set("Cookie", [`access_token=${tokenFromJwksServer}`])
          .send(managerUserData);
        const createdManagerUser = await userRepository.findOne({
          where: {
            id: response.body.data.id
          }
        });
        // Assert
        expect(createdManagerUser?.role).toBe(UserRole.MANAGER);
        expect(response.body.data.email).toBe(managerUserData.email);
      }
    );
    it("should return 404 if tenant does not exist and admin tries to create manager with that tenant", async () => {
      const adminUserData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "secret",
        role: UserRole.ADMIN
      };

      const managerUserData = {
        firstName: "JohnManager",
        lastName: "Doe",
        email: "johndoemanager@email.com",
        password: "secret",
        role: UserRole.MANAGER,
        tenantId: "fec487ed-4c71-4533-8a14-3b20f7e36614"
      };

      // Register a user (create a user in the database)
      const userRepository = dataSource.getRepository(User);
      const createdAdminUser = await userRepository.save(adminUserData);
      // Generate a token
      const tokenFromJwksServer = jwksMockServer.token({
        sub: createdAdminUser.id,
        role: createdAdminUser.role
      });
      // Add token to cookie
      const response = await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${tokenFromJwksServer}`])
        .send(managerUserData);
      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
