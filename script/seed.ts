import bcrypt from "bcrypt";
import { AppDataSource } from "../src/config/dataSource";
import { User } from "../src/entities/user";
import { UserRole } from "../src/enums";

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
const adminFirstName = process.env.SEED_ADMIN_FIRST_NAME || "Admin";
const adminLastName = process.env.SEED_ADMIN_LAST_NAME || "User";

const seedAdminUser = async () => {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await userRepository.save({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN
    });

    console.log(`Admin user created: ${adminEmail}`);
  } finally {
    await AppDataSource.destroy();
  }
};

seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user", error);
  process.exit(1);
});
