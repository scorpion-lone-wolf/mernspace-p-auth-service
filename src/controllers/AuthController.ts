import { Response } from "express";
import { Logger } from "winston";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";

export class AuthController {
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

      res.status(201).json({
        id: user.id
      });
    } catch (error) {
      throw error;
    }
  }
}
