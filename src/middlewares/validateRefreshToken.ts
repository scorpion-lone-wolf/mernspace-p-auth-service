import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { TokenPayload } from "../types";
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the refresh token from the cookies
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw createHttpError(401, "Unauthorized");
    }
    // validate that refresh token
    const verifiedToken = jwt.verify(
      refreshToken,
      Config.REFRESH_TOKEN_SECRET,
      { algorithms: ["HS256"], issuer: "auth-service" }
    );
    if (!verifiedToken) {
      throw createHttpError(401, "Unauthorized");
    }
    req.user = verifiedToken as TokenPayload;

    next();
  } catch (error) {
    if (
      error instanceof createHttpError.HttpError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      throw createHttpError(401, "Unauthorized");
    }
    throw error;
  }
};
