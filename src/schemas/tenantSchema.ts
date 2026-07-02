import z from "zod";

export const tenantSchema = z.object({
  name: z.string().min(2, "Tenant name is required"),
  address: z.string().min(5, "Tenant address is required")
});
