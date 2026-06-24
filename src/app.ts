import expres, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import logger from "./config/logger";

const app = expres();

app.get("/", async (req, res, next) => {
  const err = createHttpError(404, "Not Found");
  throw err;
  // res.send("Welcome to Auth Service");
});

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
