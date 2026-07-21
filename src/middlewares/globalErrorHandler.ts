import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "../config/logger";

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // generate a random uuid so that error error get a random unique id
  const errorId = crypto.randomUUID();
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction ? "Internal Server Error" : err.message;
  logger.error(err.message, {
    id: errorId,
    error: err.stack,
    path: req.path,
    method: req.method,
    statusCode
  });
  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        message,
        path: req.path,
        method: req.method,
        location: "server",
        stack: isProduction ? null : err.stack
      }
    ]
  });
};
