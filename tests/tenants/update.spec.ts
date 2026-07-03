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

describe("PATCH /admin/tenants", () => {
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

  describe("Given user is logged in and authorized", () => {
    it("should return 200 status code", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const tenant = await dataSource.getRepository(Tenant).save(tenantData);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .patch(`/admin/tenants/${tenant.id}`)
        .set("Cookie", [`access_token=${accessToken}`])
        .send({
          name: "Tenant-2",
          address: "Address-2"
        });
      // Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return 400 status code for empty body", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const tenant = await dataSource.getRepository(Tenant).save(tenantData);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .patch(`/admin/tenants/${tenant.id}`)
        .set("Cookie", [`access_token=${accessToken}`])
        .send({});
      // Assert
      expect(response.statusCode).toBe(400);
    });
    it("should return update the tenant", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const tenant = await dataSource.getRepository(Tenant).save(tenantData);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .patch(`/admin/tenants/${tenant.id}`)
        .set("Cookie", [`access_token=${accessToken}`])
        .send({
          name: "Tenant-2"
        });
      // Assert
      expect(response.body.data.name).toBe("Tenant-2");
    });
  });
});
