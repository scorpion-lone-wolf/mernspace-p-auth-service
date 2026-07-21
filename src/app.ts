import cookieParser from "cookie-parser";
import cors from "cors";
import expres from "express";
import "reflect-metadata";
import { Config } from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
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
app.use(globalErrorHandler);

export default app;
