import express from "express";
import { AppDataSource } from "../config/dataSource";
import logger from "../config/logger";

import { User } from "../entities/user";
import { valdiate } from "../middlewares/validate";

import { AuthController } from "../controllers/authController";
import { RefreshToken } from "../entities/refreshToken";
import { authenticate } from "../middlewares/authenticate";
import { valdiateRefreshToken } from "../middlewares/validateRefreshToken";
import { loginUserSchema } from "../schemas/loginUserSchema";
import { registerUserSchema } from "../schemas/registerUserSchema";
import { TokenService } from "../services/tokenService";
import { UserService } from "../services/userService";

const authRouter = express.Router();

// This is dependency injection
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger, tokenService);

// all the routes realted to auth
authRouter.post("/register", valdiate(registerUserSchema), (req, res) =>
  authController.register(req, res)
); // calling like this don't let register to loose its "this" context

authRouter.post("/login", valdiate(loginUserSchema), (req, res) =>
  authController.login(req, res)
);

authRouter.get("/me", authenticate, (req, res) => authController.me(req, res));

authRouter.post("/refresh", valdiateRefreshToken, (req, res) =>
  authController.refresh(req, res)
);
authRouter.post("/logout", valdiateRefreshToken, (req, res) =>
  authController.logout(req, res)
);

export default authRouter;
