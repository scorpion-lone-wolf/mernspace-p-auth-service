import { Request, Response } from "express";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { User } from "../entities/user";
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
      this.logger.info("New Request to login user", {
        email: email,
        password: "*********"
      });
      // TODO :
      // A single  user can have only 2 refresh tokens at a time
      // So if user tries to login , and we found that he already has 2 refresh tokens in RefreshToken table
      // Then we will delete one from RefreshToken table
      // and then proceed to login the user

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

      this.logger.info("User logged in successfully", { id: user.id });
      return res
        .status(200)
        .json({ data: [{ id: user.id }], message: "Login successful" });
    } catch (error) {
      throw error;
    }
  }

  async me(req: Request, res: Response) {
    try {
      const { sub } = req?.user || {};
      if (!sub) {
        throw createHttpError(401, "Unauthorized");
      }
      // check if the user exist with this id or not , if so return the user
      const user = await this.userService.getUserById(sub);
      if (!user) {
        throw createHttpError(404, "User not found");
      }
      return res.status(200).json({
        data: [
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  async refresh(req: Request, res: Response) {
    if (!req.user) {
      throw createHttpError(401, "Unauthorized");
    }
    const newRefreshTokenEntry = await this.tokenService.rotateRefreshToken(
      req.user.jti,
      { id: req.user.sub, role: req.user.role } as User
    );
    const newAccessToken = await this.tokenService.generateAccessToken(
      this.logger,
      { id: req.user.sub, role: req.user.role } as User
    );
    const newRefreshToken = await this.tokenService.generateRefreshToken(
      { id: req.user.sub, role: req.user.role } as User,
      newRefreshTokenEntry
    );
    //  add access_token and refresh_token in the respons cookie
    setAuthCookies(
      res,
      newAccessToken,
      newRefreshToken,
      this.hourInMilliSeconds
    );
    return res.json({ message: "refresh success" });
  }

  async logout(req: Request, res: Response) {
    if (!req.user) {
      return res.status(200).json({ message: "Logout success" });
    }
    // remove the refresh token entry from the database
    await this.tokenService.removeRefreshToken(req.user.jti);

    return res.status(200).json({ message: "Logout success" });
  }
}
