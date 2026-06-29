import { Response } from "express";
import { Config } from "../config";
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  hourInMilliSeconds: number
) => {
  // Step 4: Set cookies in response to include access_token and refresh_token
  res.cookie("access_token", accessToken, {
    domain: "localhost", // TODO: this should be actual domain
    sameSite: "strict",
    httpOnly: true,
    maxAge: Config.ACCESS_TOKEN_VALIDITY_IN_HOURS * hourInMilliSeconds // x hours
  });
  res.cookie("refresh_token", refreshToken, {
    domain: "localhost", // TODO: this should be actual domain
    sameSite: "strict",
    httpOnly: true,
    maxAge: Config.REFRESH_TOKEN_VALIDITY_IN_DAYS * hourInMilliSeconds * 24 // x days
  });
};
