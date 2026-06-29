import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/dataSource";
import logger from "./config/logger";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");
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
