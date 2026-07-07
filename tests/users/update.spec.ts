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
import { Tenant } from "../../src/entities/tenant";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/enums";

describe("PATCH /users/:id", () => {
  let dataSource: DataSource;
  let jwksMockServer: ReturnType<typeof createJWKSMock>;
  let jwksCleanup: () => void;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    jwksMockServer = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    jwksCleanup = jwksMockServer.start();
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterEach(async () => {
    jwksCleanup();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  const createUser = async (role: UserRole, email: string) => {
    return dataSource.getRepository(User).save({
      firstName: role,
      lastName: "User",
      email,
      password: "secret123",
      role
    });
  };

  const tokenFor = (user: User) => {
    return jwksMockServer.token({
      sub: user.id,
      role: user.role
    });
  };

  it("should update a user and return updated user data", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({
        firstName: "New Manager"
      });

    const updatedUser = await dataSource.getRepository(User).findOne({
      where: { id: manager.id }
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.id).toBe(manager.id);
    expect(response.body.data.firstName).toBe("New Manager");
    expect(response.body.data).not.toHaveProperty("password");
    expect(updatedUser?.firstName).toBe("New Manager");
  });

  it("should return 401 if user is not authenticated", async () => {
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .send({ firstName: "New Manager" });

    expect(response.statusCode).toBe(401);
  });

  it("should return 403 if user is not admin", async () => {
    const nonAdmin = await createUser(UserRole.MANAGER, "notadmin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const token = tokenFor(nonAdmin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${token}`])
      .send({ firstName: "New Manager" });

    expect(response.statusCode).toBe(403);
  });

  it("should return 400 for invalid user id", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch("/users/not-a-uuid")
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ firstName: "New Manager" });

    expect(response.statusCode).toBe(400);
  });

  it("should return 400 for empty body", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({});

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 if user is not found", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch("/users/a17527a0-8c62-4c1b-9819-11b32cae28d8")
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ firstName: "New Manager" });

    expect(response.statusCode).toBe(404);
  });

  it("should return 409 if updated email already exists", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    await createUser(UserRole.CUSTOMER, "taken@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ email: "taken@example.com" });

    expect(response.statusCode).toBe(409);
  });

  it("should return 404 if tenant is not found", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ tenantId: "a17527a0-8c62-4c1b-9819-11b32cae28d8" });

    expect(response.statusCode).toBe(404);
  });

  it("should update tenant when tenant exists", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const tenant = await dataSource.getRepository(Tenant).save({
      name: "Tenant-1",
      address: "Address-1"
    });
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .patch(`/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ tenantId: tenant.id });

    const updatedUser = await dataSource.getRepository(User).findOne({
      where: { id: manager.id },
      relations: { tenant: true }
    });
    expect(response.statusCode).toBe(200);
    expect(updatedUser?.tenant.id).toBe(tenant.id);
  });
});
