import { config as dotenvConfig } from "dotenv";
import path from "node:path";

const nodeEnv = process.env.NODE_ENV;

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
  DB_DATABASE_NAME: requiredEnv("DB_DATABASE_NAME")
};

export const Config = Object.freeze(config);
