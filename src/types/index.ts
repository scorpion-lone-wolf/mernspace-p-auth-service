import { Request } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { loginUserSchema } from "../schemas/loginUserSchema";
import { registerUserSchema } from "../schemas/registerUserSchema";
// creating UserData type based on registerUserSchema
export type UserData = z.infer<typeof registerUserSchema>;
export type LoginUserData = z.infer<typeof loginUserSchema>;

export interface RegisterUserRequest extends Request {
  body: UserData;
}
export interface LoginUserRequest extends Request {
  body: LoginUserData;
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
