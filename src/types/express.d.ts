import type { TokenPayload } from "./index";
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      validatedQuery?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
      };
    }
  }
}

export {};
