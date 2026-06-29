import { Response } from "express";
import { Logger } from "winston";
import { TokenService } from "../services/tokenService";
import { UserService } from "../services/userService";
import { LoginUserRequest, RegisterUserRequest } from "../types";
import { setAuthCookies } from "../utils/authCookies";

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

      // Set cookies in response to include access_token and refresh_token
      setAuthCookies(res, accessToken, refreshToken, this.hourInMilliSeconds);

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

  async login(req: LoginUserRequest, res: Response) {
    try {
      // Get the email and password from request body
      const { email, password } = req.body;
      const user = await this.userService.login({ email, password });

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
      setAuthCookies(res, accessToken, refreshToken, this.hourInMilliSeconds);

      return res.status(200).json({ id: user.id, message: "Login successful" });
    } catch (error) {
      throw error;
    }
  }
}
