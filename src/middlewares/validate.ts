import { type NextFunction, type Request, type Response } from "express";
import createHttpError from "http-errors";
import { ZodError, ZodType } from "zod";

export const valdiate =
  (schama: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schama.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw createHttpError(400, error.issues[0]?.message as string);
      }
      throw createHttpError(400, "Validation failed. Invalid request. ");
    }
  };

export const validateParams =
  (schama: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schama.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw createHttpError(400, error.issues[0]?.message as string);
      }
      throw createHttpError(400, "Validation failed. Invalid request. ");
    }
  };

export const validateQuery =
  (schama: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedQuery = schama.parse(req.query)!;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw createHttpError(400, error.issues[0]?.message as string);
      }
      throw createHttpError(400, "Validation failed. Invalid request. ");
    }
  };
