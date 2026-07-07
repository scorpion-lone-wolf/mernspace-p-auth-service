import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppDataSource } from "../../src/config/dataSource";
import { User } from "../../src/entities/user";
import generateAdminUser from "../../src/utils/generateAdminUser";

describe("Given the application run", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });

  afterAll(async () => {
    dataSource.destroy();
  });

  it("should create the admin user if not exist", async () => {
    const userRepository = dataSource.getRepository(User);
    await generateAdminUser();
    const user = await userRepository.findOneBy({ email: "admin@admin.com" });
    expect(user).not.toBeNull();
  });
});
