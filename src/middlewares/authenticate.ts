import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { jwkClient } from "../config/jwks";
// This function is responsible to validate the token
// If valid then add that to req.user={sub,role}
// else , we throw error with status code 401 unauthorized
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get the token from the cookie
    let accessToken;
    accessToken = req.cookies.access_token;
    // if not present in cookies, then get the token from the header
    if (!accessToken) {
      accessToken = req.headers.authorization?.split(" ")[1];
    }
    // if not present in cookie or header, then throw error
    if (!accessToken) {
      throw createHttpError(401, "Unauthorized");
    }
    // decode and get the kid from the decodedValue (still we have not verified the token that it is valid or not)
    const decodedValue = jwt.decode(accessToken, { complete: true }); // { complete: true } is required to get  header + payload + signature
    if (!decodedValue) {
      throw createHttpError(401, "Unauthorized");
    }
    // This decodedValue will have structure like
    /**
      {
            header: {
              alg: 'RS256',
              typ: 'JWT',
              kid: 'UEtJU0huRVZ0QkZpT0xuQzlHeGtQcll1azdBPQ'
            },
            payload: {
              sub: 'bf520daf-7f43-4d33-b979-afe24e9ee191',
              role: 'CUSTOMER',
              iat: 1782752876
            },
            signature: ''
      }
     */
    const kid = decodedValue.header.kid;
    const key = await jwkClient.getSigningKey(kid);
    const publicKey = key.getPublicKey(); // This public key will be used to verify the token
    console.log("Public", publicKey);
    // verify the token
    const verifiedToken = jwt.verify(accessToken, publicKey, {
      algorithms: ["RS256"]
    });

    req.user = verifiedToken;
    return next();
  } catch (error) {
    throw error;
  }
};
