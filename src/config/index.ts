import { config as dotenvConfig } from "dotenv";
import path from "node:path";

const nodeEnv = process.env.NODE_ENV || "development";

dotenvConfig({
  path: path.join(__dirname, `../../.env.${nodeEnv}`)
});

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const config = {
  PORT: requiredEnv("PORT"),
  NODE_ENV: nodeEnv,
  DB_HOST: requiredEnv("DB_HOST"),
  DB_PORT: requiredEnv("DB_PORT"),
  DB_USERNAME: requiredEnv("DB_USERNAME"),
  DB_PASSWORD: requiredEnv("DB_PASSWORD"),
  DB_DATABASE_NAME: requiredEnv("DB_DATABASE_NAME"),
  REFRESH_TOKEN_SECRET: requiredEnv("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_VALIDITY_IN_DAYS: Number(
    requiredEnv("REFRESH_TOKEN_VALIDITY_IN_DAYS")
  ),
  ACCESS_TOKEN_VALIDITY_IN_HOURS: Number(
    requiredEnv("ACCESS_TOKEN_VALIDITY_IN_HOURS")
  ),
  JWKS_URI: requiredEnv("JWKS_URI"),
  PRIVATE_KEY: requiredEnv("PRIVATE_KEY"),
  ADMIN_EMAIL: requiredEnv("ADMIN_EMAIL"),
  ADMIN_PASSWORD: requiredEnv("ADMIN_PASSWORD"),
  FRONTEND_URL: requiredEnv("FRONTEND_URL")
};

export const Config = Object.freeze(config);
