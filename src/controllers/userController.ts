import { Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserData, CreateUserRequest } from "../types";

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: CreateUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized"
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      }: CreateUserData = req.body;
      const createdUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      });
      res.status(201).json({
        message: "User created successfully",
        data: createdUser
      });
    } catch (error) {
      throw error;
    }
  }
}
