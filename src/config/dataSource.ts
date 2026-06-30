import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
import { RefreshToken } from "../entities/refreshToken";
import { User } from "../entities/user";

const isTest = Config.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_DATABASE_NAME,
  // for production set synchronize: false
  synchronize: isTest,
  logging: false,
  entities: [User, RefreshToken],
  migrations: isTest ? [] : [__dirname + "/../migrations/*.{ts}"],
  subscribers: [],
  migrationsRun: false // don't run migration on every app start
});
