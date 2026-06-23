import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const { PORT, NODE_ENV } = process.env;

if (!PORT) {
  throw new Error("PORT is required");
}

const config = {
  PORT
};

export const Config = Object.freeze(config);
