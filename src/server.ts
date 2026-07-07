import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/dataSource";
import logger from "./config/logger";
import generateAdminUser from "./utils/generateAdminUser";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");
    // initializing the admin user in the database if it does not exist
    await generateAdminUser();
    app.listen(PORT, () => {
      logger.info(`Auth Service Started on PORT:${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    console.error(error);
    process.exit(1);
  }
};
startServer();
