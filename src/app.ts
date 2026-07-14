import cookieParser from "cookie-parser";
import cors from "cors";
import expres, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import "reflect-metadata";
import { Config } from "./config";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";

const app = expres();
app.disable("x-powered-by"); // disable x-powered-by so that attacker will not know the server uses express

// make sure json data is available in req.body
app.use(expres.json());
// make sure cookie data is available in req.cookies
app.use(cookieParser());
// adding static files
app.use(expres.static("public", { dotfiles: "allow" }));
// enable cors for all routes and origins
app.use(
  cors({
    origin: [Config.FRONTEND_URL || "http://localhost:5173"],
    credentials: true
  })
);

// route handlers
app.get("/", async (req, res, next) => {
  res.send("Welcome to Auth Service again");
});

app.use("/auth", authRouter);

app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

// global error handler (it has 4 param which help express distinguish between normal middleware and global error handler)
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: "", // url path where error has occur
        location: "" // location like line number where error has occur
      }
    ]
  });
});

export default app;
