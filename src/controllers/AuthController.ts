import { Response } from "express";
import { Logger } from "winston";
import { Config } from "../config";
import { TokenService } from "../services/tokenService";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";

export class AuthController {
  hourInMilliSeconds = 1000 * 60 * 60; // 1 hr in milliseconds
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService
  ) {}
  async register(req: RegisterUserRequest, res: Response) {
    // Step 1: Getting json body from request
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New Request to register user", {
      firstName,
      lastName,
      email,
      password: "*********"
    });

    try {
      // Step 2: Create user
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password
      });
      this.logger.info("User registered successfully", { id: user.id });

      // Step 3: Generate access_token and refresh_token
      const accessToken = await this.tokenService.generateAccessToken(
        this.logger,
        user
      );

      // adding an entry in refresh_token table for the user
      const newRefreshTokenEntry = await this.tokenService.persistRefreshToken(
        user,
        this.hourInMilliSeconds
      );
      const refreshToken = await this.tokenService.generateRefreshToken(
        user,
        newRefreshTokenEntry
      );

      // Step 4: Set cookies in response to include access_token and refresh_token
      res.cookie("access_token", accessToken, {
        domain: "localhost", // TODO: this should be actual domain
        sameSite: "strict",
        httpOnly: true,
        maxAge: Config.ACCESS_TOKEN_VALIDITY_IN_HOURS * this.hourInMilliSeconds // x hours
      });
      res.cookie("refresh_token", refreshToken, {
        domain: "localhost", // TODO: this should be actual domain
        sameSite: "strict",
        httpOnly: true,
        maxAge:
          Config.REFRESH_TOKEN_VALIDITY_IN_DAYS * this.hourInMilliSeconds * 24 // x days
      });

      // Step 5: Send response to the user
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
