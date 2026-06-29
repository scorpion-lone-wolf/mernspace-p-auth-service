import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service"
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  // transport are nothing but places where logs will be stored eg, console, db, file etc
  transports: [
    new winston.transports.Console({
      level: "info",
      silent: Config.NODE_ENV == "test"
      // || Config.NODE_ENV == "development" // in test and development we don't want to log anything
    }),
    new winston.transports.File({
      level: "info",
      filename: "combined.log",
      dirname: "logs",
      silent: Config.NODE_ENV == "test" || Config.NODE_ENV == "development" // in test and development we don't want to log anything
    }),
    new winston.transports.File({
      level: "error",
      filename: "error.log",
      dirname: "logs",
      silent: Config.NODE_ENV == "test" || Config.NODE_ENV == "development" // in test and development we don't want to log anything
    })
  ]
});

export default logger;
