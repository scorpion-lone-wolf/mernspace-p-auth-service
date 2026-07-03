import { Request, Response } from "express";
import createHttpError from "http-errors";
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

  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Math.max(1, Number(page) || 1);
      const limitNumber = Math.max(1, Number(limit) || 10);
      const users = await this.userService.fetchAll(+pageNumber, +limitNumber);
      return res.json({
        message: "Users fetched successfully",
        data: users
      });
    } catch (error) {}
  }
  async get(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createHttpError(400, "User id is required");
      }
      const users = await this.userService.fetch(String(id));
      return res.json({
        message: "Users fetched successfully",
        data: users
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createHttpError(400, "User id is required");
      }
      const user = await this.userService.delete(String(id));
      return res.json({
        message: "User deleted",
        data: user
      });
    } catch (error) {
      throw error;
    }
  }
}
