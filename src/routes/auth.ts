import express from "express";
import { AuthController } from "../controllers/AuthController";

const authRouter = express.Router();
const authController = new AuthController();

// all the routes realted to auth
authRouter.post("/register", (req, res) => authController.register(req, res)); // calling like this don't let register to loose its "this" context

export default authRouter;
