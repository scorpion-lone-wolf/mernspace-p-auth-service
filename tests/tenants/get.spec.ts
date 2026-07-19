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

describe("GET /tenants", () => {
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
      //   Act
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .get("/tenants")
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return list of tenants data", async () => {
      // Prepare
      const tenantData = {
        name: "Tenant-1",
        address: "Address-1"
      };
      //   Act
      //   save the tenat data in to database
      await dataSource.getRepository(Tenant).save(tenantData);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .get("/tenants")
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.body.data.length).toBe(1);
    });
    it("should filter tenants by search query", async () => {
      // Prepare
      const tenantRepository = dataSource.getRepository(Tenant);
      await tenantRepository.save([
        {
          name: "Kolkata Foods",
          address: "Central Avenue"
        },
        {
          name: "Delhi Market",
          address: "Salt Lake"
        },
        {
          name: "Mumbai Store",
          address: "Marine Drive"
        }
      ]);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      //   Act
      const response = await request(app)
        .get("/tenants")
        .query({ search: "kolkata" })
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Kolkata Foods");
      expect(response.body.total).toBe(1);
    });
    it("should paginate tenants after applying search query", async () => {
      // Prepare
      const tenantRepository = dataSource.getRepository(Tenant);
      await tenantRepository.save([
        {
          name: "Kolkata Foods",
          address: "Central Avenue"
        },
        {
          name: "Delhi Market",
          address: "Salt Lake"
        },
        {
          name: "Mumbai Store",
          address: "Marine Drive"
        }
      ]);
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      //   Act
      const response = await request(app)
        .get("/tenants")
        .query({ search: "market", page: 1, limit: 1 })
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.total).toBe(1);
    });
    it("should return 400 status code for invalid page query", async () => {
      //   Act
      const response = await request(app).get("/tenants").query({ page: 0 });
      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
  describe("Given user is not logged nor authorized as the endpoint is public", () => {
    it("should return 200 status code", async () => {
      // Prepare
      //   Act
      const response = await request(app).get("/tenants");
      // Assert
      expect(response.statusCode).toBe(200);
    });
  });
  describe("Given user is  logged but not authorized", () => {
    it("should return 200 status code", async () => {
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.CUSTOMER
      });
      const response = await request(app)
        .get("/tenants")
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(200);
    });
  });
});

describe("GET /tenants/:id", () => {
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
        .get(`/tenants/${tenant.id}`)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return tenant data", async () => {
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
        .get(`/tenants/${tenant.id}`)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.body.data.name).toBe(tenantData.name);
    });
    it("should return 404 if tenant not found", async () => {
      //   Act
      const accessToken = jwksServer.token({
        sub: "a17527a0-8c62-4c1b-9819-11b32cae28d8",
        role: UserRole.ADMIN
      });
      const response = await request(app)
        .get(`/tenants/a17527a0-8c62-4c1b-9819-11b32cae28d8`)
        .set("Cookie", [`access_token=${accessToken}`]);
      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
