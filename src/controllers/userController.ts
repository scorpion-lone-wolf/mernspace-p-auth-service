import { Request, Response } from "express";
import createHttpError from "http-errors";
import { UserService } from "../services/userService";
import { CreateUserData, CreateUserRequest, UpdateUserRequest } from "../types";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: CreateUserRequest, res: Response) {
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
  }

  async getAll(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const users = await this.userService.fetchAll(+pageNumber, +limitNumber);
    return res.json({
      message: "Users fetched successfully",
      data: users
    });
  }
  async get(req: Request, res: Response) {
    const id = String(req.params.id);
    const users = await this.userService.fetch(id);
    return res.json({
      message: "Users fetched successfully",
      data: users
    });
  }

  async update(req: UpdateUserRequest, res: Response) {
    const id = String(req.params.id);
    // check at least one field is ask to be updated
    if (Object.keys(req.body).length === 0) {
      throw createHttpError(400, "At least one field is required to update");
    }
    const { firstName, lastName, email, role, tenantId } = req.body;
    const user = await this.userService.update(id, {
      firstName,
      lastName,
      email,
      role,
      tenantId
    });
    return res.json({
      message: "User updated",
      data: user
    });
  }
  async delete(req: Request, res: Response) {
    const id = String(req.params.id);
    // check if admin user wants to delete themselves or not
    const adminUserId = req.user?.sub;
    if (id === adminUserId) {
      throw createHttpError(400, "You can't delete yourself");
    }
    const user = await this.userService.delete(id);
    return res.json({
      message: "User deleted",
      data: user
    });
  }
}
