import z from "zod";
import { UserRole } from "../enums";

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(6),
  search: z.string().optional(),
  role: z.enum(UserRole).optional(),
  status: z.enum(["ACTIVE", "BANNED"]).optional()
});
