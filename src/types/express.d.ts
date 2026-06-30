import type { TokenPayload } from "./index";
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
