import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import { Repository } from "typeorm";
import { Logger } from "winston";
import { Config } from "../config";
import { RefreshToken } from "../entities/refreshToken";
import { User } from "../entities/user";
export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  async generateAccessToken(logger: Logger, user: User) {
    let privateKey: string;
    try {
      privateKey = await fs.readFile(
        path.join(__dirname, "../../keys/private.pem"),
        "utf-8"
      );
    } catch (error) {
      console.log("err", error);
      logger.error("Failed to read key", { error });
      throw createHttpError(500, "Failed to read key");
    }
    const accessToken = jwt.sign(
      {
        sub: user.id,
        role: user.role
      },
      privateKey,
      {
        expiresIn: `${Config.REFRESH_TOKEN_VALIDITY_IN_DAYS}h`,
        algorithm: "RS256",
        issuer: "auth-service"
      }
    );
    return accessToken;
  }

  async generateRefreshToken(user: User, newRefreshTokenEntry: RefreshToken) {
    const refreshToken = jwt.sign(
      {
        sub: user.id,
        role: user.role
      },
      Config.REFRESH_TOKEN_SECRET,
      {
        expiresIn: `${Config.ACCESS_TOKEN_VALIDITY_IN_HOURS}h`,
        algorithm: "HS256",
        issuer: "auth-service",
        jwtid: String(newRefreshTokenEntry.id) // use refresh token id as jwtid
      }
    );
    return refreshToken;
  }

  async persistRefreshToken(user: User, hourInMilliSeconds: number) {
    const newRefreshTokenEntry = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(
        Date.now() +
          Config.REFRESH_TOKEN_VALIDITY_IN_DAYS * hourInMilliSeconds * 24
      )
    });
    return newRefreshTokenEntry;
  }
}
