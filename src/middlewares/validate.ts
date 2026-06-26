import { type NextFunction, type Request, type Response } from "express";
import createHttpError from "http-errors";
import { ZodType } from "zod";

export const valdiate =
  (schama: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schama.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof Error) {
        throw createHttpError(400, error.message);
      }
      throw createHttpError(400, "Validation failed. Invalid request. ");
    }
  };
