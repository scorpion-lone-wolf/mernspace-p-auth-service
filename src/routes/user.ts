import express from "express";
import { AppDataSource } from "../config/dataSource";
import { UserController } from "../controllers/userController";
import { Tenant } from "../entities/tenant";
import { User } from "../entities/user";
import { UserRole } from "../enums";
import { authenticate } from "../middlewares/authenticate";
import authorized from "../middlewares/authorized";
import { valdiate, validateParams } from "../middlewares/validate";
import { createUserSchema } from "../schemas/createUserSchema";
import { idParamSchema } from "../schemas/paramsSchema";
import { updateUserSchema } from "../schemas/updateUserSchema";
import { UserService } from "../services/userService";

const userRouter = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, tenantRepository);
// dependencies
const userController = new UserController(userService);

userRouter.post(
  "/",
  authenticate,
  authorized([UserRole.ADMIN]),
  valdiate(createUserSchema),
  (req, res) => userController.create(req, res)
);
userRouter.get("/", authenticate, authorized([UserRole.ADMIN]), (req, res) =>
  userController.getAll(req, res)
);
userRouter.get(
  "/:id",
  authenticate,
  authorized([UserRole.ADMIN]),
  validateParams(idParamSchema),
  (req, res) => userController.get(req, res)
);
userRouter.patch(
  "/:id",
  authenticate,
  authorized([UserRole.ADMIN]),
  validateParams(idParamSchema),
  valdiate(updateUserSchema),
  (req, res) => userController.update(req, res)
);
userRouter.delete(
  "/:id",
  authenticate,
  authorized([UserRole.ADMIN]),
  validateParams(idParamSchema),
  (req, res) => userController.delete(req, res)
);

export default userRouter;
