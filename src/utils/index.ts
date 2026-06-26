import { QueryFailedError } from "typeorm";

export const isUniqueConstraintError = (error: unknown): boolean => {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  if ("code" in error) {
    // error.code for Postgres, Mongodb
    return (
      error.code === "23505" ||
      error.code === 11000 ||
      error.code === 11001 ||
      error.code === "SQLITE_CONSTRAINT"
    );
  }
  if ("errno" in error) {
    // error.errno for Mysql and MariaDB
    return error.errno === 1062;
  }
  return false;
};
