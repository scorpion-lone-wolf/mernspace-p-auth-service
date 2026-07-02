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
import { UserRole } from "../../src/enums";
describe("POST /admin/tenants", () => {
  let dataSource: DataSource;
  let jwksServer: ReturnType<typeof createJWKSMock>;
  let jwksCleanup: () => void;
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    jwksServer = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    // drop the database (this will not remove the database , instead it will remove all the tables in the database)
    await dataSource.dropDatabase();
    // synchronize all the tables in the database
    await dataSource.synchronize();
    jwksCleanup = jwksServer.start();
  });
  afterEach(async () => {
    jwksCleanup();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //
      //   Act
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .post("/tenants")
        .send(tenantData)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(201);
    });
    it("should create a tenant in the database", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .post("/tenants")
        .send(tenantData)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      const tenantRepository = dataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants.length).toBe(1);
    });
    it("should return 401 if user is not authenticated", async () => {
      // prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const response = await request(app).post("/tenants").send(tenantData);
      // Assert
      const tenantRepository = dataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants.length).toBe(0);
      expect(response.statusCode).toBe(401);
    });
    it("should return 403 if user is not admin", async () => {
      // prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.MANAGER
      });
      const response = await request(app)
        .post("/tenants")
        .send(tenantData)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      const tenantRepository = dataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants.length).toBe(0);
      expect(response.statusCode).toBe(403); // Forbidden
    });
  });
});
