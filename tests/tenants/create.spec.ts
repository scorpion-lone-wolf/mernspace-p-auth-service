import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/dataSource";
import { Tenant } from "../../src/entities/tenant";

describe("POST /admin/tenants", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
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
    it("should return 201 status code", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      const response = await request(app).post("/tenants").send(tenantData);
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
      await request(app).post("/tenants").send(tenantData);
      // Assert
      const tenantRepository = dataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants.length).toBe(1);
    });
  });
  describe("Given some fields are missing", () => {
    it("should return 400 status code", async () => {
      // prepare
      const tenantData = {
        name: "Tenant-1"
      };
      //   Act
      const response = await request(app).post("/tenants").send(tenantData);
      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
});
