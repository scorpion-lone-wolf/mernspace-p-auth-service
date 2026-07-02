import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { UserRole } from "../enums";

const authorized =
  (roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //  assuming user is already authenticated
      //  still check if the user is authorized
      if (!req.user) {
        throw createHttpError(401, "Unauthorized");
      }
      if (!roles.includes(req.user.role as UserRole)) {
        throw createHttpError(403, "Forbidden");
      }
      next();
    } catch (error) {
      throw error;
    }
  };

export default authorized;
