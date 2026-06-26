import { Request } from "express";
import z from "zod";
import { registerUserSchema } from "../schemas/registerUserSchema";

// creating UserData type based on registerUserSchema
export type UserData = z.infer<typeof registerUserSchema>;

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export type ErrorResponse = {
  type: string;
  message: string;
  path: string;
  location: string;
};
