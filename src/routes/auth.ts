import express from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entities/User";
import { UserService } from "../services/UserService";

const authRouter = express.Router();

// This is dependency injection

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

// all the routes realted to auth
authRouter.post("/register", (req, res) => authController.register(req, res)); // calling like this don't let register to loose its "this" context

export default authRouter;
