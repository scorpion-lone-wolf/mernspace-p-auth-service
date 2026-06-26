import expres, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import "reflect-metadata";
import logger from "./config/logger";
import authRouter from "./routes/auth";

const app = expres();
// make sure json data is available in req.body
app.use(expres.json());

// route handlers
app.get("/", async (req, res, next) => {
  res.send("Welcome to Auth Service again");
});

app.use("/auth", authRouter);

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
