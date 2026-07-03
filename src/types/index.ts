import { Request } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { createUserSchema } from "../schemas/createUserSchema";
import { loginUserSchema } from "../schemas/loginUserSchema";
import { registerUserSchema } from "../schemas/registerUserSchema";
import { tenantSchema } from "../schemas/tenantSchema";
import { updateUserSchema } from "../schemas/updateUserSchema";

export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

export type LoginUserData = z.infer<typeof loginUserSchema>;

export type CreateTenantData = z.infer<typeof tenantSchema>;

export interface RegisterUserRequest extends Request {
  body: RegisterUserData;
}
export interface LoginUserRequest extends Request {
  body: LoginUserData;
}
export interface CreateUserRequest extends Request {
  body: CreateUserData;
}
export interface UpdateUserRequest extends Request {
  body: UpdateUserData;
}

export type ErrorResponse = {
  type: string;
  message: string;
  path: string;
  location: string;
};

export interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
  iss: string;
  alg: string;
}
