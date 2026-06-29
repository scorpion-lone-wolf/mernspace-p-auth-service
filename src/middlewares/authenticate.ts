import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
// This function is responsible to validate the token
// If valid then add that to req.user={sub,role}
// else , we throw error with status code 401 unauthorized
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get the token from the cookie
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      throw createHttpError(401, "Unauthorized");
    }
    const decodedToken = jwt.decode(accessToken);
    if (!decodedToken || typeof decodedToken === "string") {
      throw createHttpError(401, "Unauthorized");
    }

    req.user = {
      sub: decodedToken.sub as string,
      role: decodedToken.role as string
    };
    return next();
  } catch (error) {
    throw error;
  }
};
