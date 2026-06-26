import bcrypt from "bcrypt";
import { Response } from "express";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
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
      // create a hash password for the user
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password: hashPassword
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
