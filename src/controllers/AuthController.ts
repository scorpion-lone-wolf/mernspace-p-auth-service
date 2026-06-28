import { Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import { Logger } from "winston";
import { Config } from "../config";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";

export class AuthController {
  hourInMilliSeconds = 1000 * 60 * 60; // 1 hr in milliseconds
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}
  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New Request to register user", {
      firstName,
      lastName,
      email,
      password: "*********"
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password
      });
      this.logger.info("User registered successfully", { id: user.id });
      let privateKey: string;
      try {
        privateKey = await fs.readFile(
          path.join(__dirname, "../../keys/private.pem"),
          "utf-8"
        );
      } catch (error) {
        console.log("err", error);
        this.logger.error("Failed to read key", { error });
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
      const refreshToken = jwt.sign(
        {
          sub: user.id,
          role: user.role
        },
        Config.REFRESH_TOKEN_SECRET,
        {
          expiresIn: `${Config.REFRESH_TOKEN_VALIDITY_IN_DAYS}d`,
          algorithm: "HS256",
          issuer: "auth-service"
        }
      );

      // set the access_token and refresh_token inside cookie
      res.cookie("access_token", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true,
        maxAge: Config.ACCESS_TOKEN_VALIDITY_IN_HOURS * this.hourInMilliSeconds // x hours
      });
      res.cookie("refresh_token", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true,
        maxAge:
          Config.REFRESH_TOKEN_VALIDITY_IN_DAYS * this.hourInMilliSeconds * 24 // x days
      });

      res.status(201).json({
        data: [
          {
            id: user.id,
            firstName: user.firstName,
            email: user.email
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  }
}
