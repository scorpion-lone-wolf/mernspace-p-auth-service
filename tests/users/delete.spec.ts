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

describe("DELETE /admin/users/:id", () => {
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
      firstName: "User",
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

  it("should delete a user and return deleted user data", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .delete(`/admin/users/${manager.id}`)
      .set("Cookie", [`access_token=${adminToken}`]);

    const user = await dataSource.getRepository(User).findOne({
      where: { id: manager.id }
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User deleted");
    expect(response.body.data.id).toBe(manager.id);
    expect(response.body.data).not.toHaveProperty("password");
    expect(user).toBeNull();
  });

  it("should return 401 if user is not authenticated", async () => {
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");

    const response = await request(app).delete(`/admin/users/${manager.id}`);

    expect(response.statusCode).toBe(401);
  });

  it("should return 403 if user is not admin", async () => {
    const nonAdmin = await createUser(UserRole.MANAGER, "notadmin@example.com");
    const manager = await createUser(UserRole.MANAGER, "manager@example.com");
    const token = tokenFor(nonAdmin);

    const response = await request(app)
      .delete(`/admin/users/${manager.id}`)
      .set("Cookie", [`access_token=${token}`]);

    expect(response.statusCode).toBe(403);
  });

  it("should return 400 for invalid user id", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .delete("/admin/users/not-a-uuid")
      .set("Cookie", [`access_token=${adminToken}`]);

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 if user is not found", async () => {
    const admin = await createUser(UserRole.ADMIN, "admin@example.com");
    const adminToken = tokenFor(admin);

    const response = await request(app)
      .delete("/admin/users/a17527a0-8c62-4c1b-9819-11b32cae28d8")
      .set("Cookie", [`access_token=${adminToken}`]);

    expect(response.statusCode).toBe(404);
  });

  it("should return 400 if admin user wants to delete themselves", async () => {
    // Prepare
    const adminUser = await createUser(UserRole.ADMIN, "admin@example.com");
    const adminToken = tokenFor(adminUser);
    // Act
    const response = await request(app)
      .delete(`/admin/users/${adminUser.id}`)
      .set("Cookie", [`access_token=${adminToken}`]);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].message).toBe("You can't delete yourself");
  });
});
