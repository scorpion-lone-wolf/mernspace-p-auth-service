import z from "zod";

export const tenantQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(6),
  search: z.string().optional()
});
