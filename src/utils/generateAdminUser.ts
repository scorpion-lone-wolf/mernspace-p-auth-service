import bcrypt from "bcrypt";
import { Config } from "../config";
import { AppDataSource } from "../config/dataSource";
import logger from "../config/logger";
import { User } from "../entities/user";

const generateAdminUser = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const adminEmail = Config.ADMIN_EMAIL;
  const adminPassword = Config.ADMIN_PASSWORD;
  //   Check if admin user is already in the database
  const adminUser = await userRepository.findOneBy({ email: adminEmail });

  if (!adminUser) {
    // create a new admin user
    const hashPassword = await bcrypt.hash(adminPassword, 10);
    const user = new User();
    user.firstName = "Admin";
    user.lastName = "Admin";
    user.email = adminEmail;
    user.password = hashPassword;
    user.role = "ADMIN";

    await userRepository.save(user);
    logger.info("Admin user created successfully");
  }
};
export default generateAdminUser;
