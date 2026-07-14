import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { MoreThan, Repository } from "typeorm";
import { Logger } from "winston";
import { Config } from "../config";
import { RefreshToken } from "../entities/refreshToken";
import { User } from "../entities/user";
export class TokenService {
  constructor(
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  async generateAccessToken(logger: Logger, user: User) {
    let privateKey: string;
    try {
      privateKey = Config.PRIVATE_KEY;
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
        // expiresIn: `${Config.ACCESS_TOKEN_VALIDITY_IN_HOURS}h`,
        expiresIn: `1m`,
        algorithm: "RS256",
        issuer: "auth-service",
        keyid: "auth-key-1"
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
        expiresIn: `${Config.REFRESH_TOKEN_VALIDITY_IN_DAYS}d`,
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

  async rotateRefreshToken(
    oldRefreshTokenId: string,
    user: User
  ): Promise<RefreshToken> {
    return await this.refreshTokenRepository.manager.transaction(
      async (manager) => {
        const refreshTokenRepository = manager.getRepository(RefreshToken);
        // check if the old refresh token is present or not
        const oldRefreshToken = await refreshTokenRepository.findOne({
          where: {
            id: oldRefreshTokenId,
            user: { id: user.id },
            expiresAt: MoreThan(new Date())
          }
        });
        // If oldRefreshToken is not found - Delete all the refresh tokens for the user
        if (!oldRefreshToken) {
          await this.refreshTokenRepository.delete({
            user: { id: user.id }
          });
          throw createHttpError(401, "Unauthorized");
        }
        // We found he old refresh token
        // Step 1: Delete the old refresh token entry
        await refreshTokenRepository.delete({
          id: oldRefreshTokenId
        });
        // Step 2: Generate a new refresh token entry
        const newRefreshTokenEntry = await refreshTokenRepository.save({
          user: { id: user.id },
          expiresAt: new Date(
            Date.now() +
              Config.REFRESH_TOKEN_VALIDITY_IN_DAYS * 1000 * 60 * 60 * 24
          )
        });
        return newRefreshTokenEntry;
      }
    );
  }

  async removeRefreshToken(refreshTokenId: string) {
    return await this.refreshTokenRepository.delete({
      id: refreshTokenId
    });
  }
}
